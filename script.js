let defaultConfiguration = [
  ["cameraHeight", 0.9],
  ["nearDeathFadeMin", 15],
  ["nearDeathFadeMax", 17.3],
  ["nearDeathFadeMaxDesat", 1],
  ["mass", 1],
  ["friction", 1],
  ["bounce", 0.25],
  ["gravityScale", 1],
  ["inputTorque", 6],
  ["inputVelocity", 8],
  ["jumpForce", 6],
  ["jumpBufferTime", 0.3],
  ["coyoteTime", 0.3],
  ["idleRotationalSpeedReductionRate", 30],
  ["velocitySpeedCap", 5],
  ["rotationalSpeedGroundCap", 12],
  ["rotationalSpeedAirCap", 6],
  ["rotationalSpeedReductionRatio", 70],
  ["jumpableSlope", 0.5],
  ["damageStartImpact", 17.3],
  ["hitstunStartImpact", 4],
  ["hitstunHighestImpact", 12],
  ["hitstunDuration", 0.4],
];

let userConfiguration = JSON.parse(JSON.stringify(defaultConfiguration));

function showError(message) {
  document.getElementById("errorcontainer").style.display = "block";
  document.querySelector("#error > p").innerText = message;
}

window.addEventListener("load", () => {
  for (let conf = 0; conf < defaultConfiguration.length; conf++) {
    let label = document.createElement("label");
    label.innerText = defaultConfiguration[conf][0];
    label.htmlFor = defaultConfiguration[conf][0];
    let input = document.createElement("input");
    input.id = defaultConfiguration[conf][0];
    input.step = "0.01";
    input.type = "number";
    input.value = defaultConfiguration[conf][1];
    input.placeholder = defaultConfiguration[conf][1];
    document
      .getElementById("settings")
      .append(label, input, document.createElement("hr"));
  }

  document.getElementById("expectedfile").addEventListener("change", () => {
    document.getElementById("expectedlabel").innerText =
      document.getElementById("expectedfile").files[0].name || "no file";
  });
  document
    .getElementById("expectedfilebutton")
    .addEventListener("click", () => {
      document.getElementById("expectedfile").click();
    });

  document.getElementById("goalfile").addEventListener("change", () => {
    document.getElementById("goallabel").innerText =
      document.getElementById("goalfile").files[0].name || "no file";
  });
  document.getElementById("goalfilebutton").addEventListener("click", () => {
    document.getElementById("goalfile").click();
  });

  document.getElementById("scene").addEventListener("change", () => {
    document.getElementById("scenelabel").innerText =
      document.getElementById("scene").files[0].name || "no file";
  });
  document.getElementById("scenebutton").addEventListener("click", () => {
    document.getElementById("scene").click();
  });

  document.querySelector("#error > button").addEventListener("click", () => {
    document.getElementById("errorcontainer").style.display = "none";
  });

  document.getElementById("reloadexpected").addEventListener("submit", () => {
    document
      .querySelector("#reloadexpected > input:nth-child(1)")
      .files[0].text()
      .then((data) => {
        try {
          let tempConfiguration = JSON.parse(data);
          let tempUserConfiguration = JSON.parse(
            JSON.stringify(userConfiguration),
          );
          for (let conf = 0; conf < tempConfiguration.length; conf++) {
            if (defaultConfiguration[conf][0] === tempConfiguration[conf][0]) {
              tempUserConfiguration[conf][1] = tempConfiguration[conf][1];
            } else {
              showError(
                'invalid content in JSON. found "' +
                  tempConfiguration[conf][0] +
                  '". expected "' +
                  defaultConfiguration[conf][0] +
                  '".',
              );
              return;
            }
          }
          userConfiguration = tempUserConfiguration;
        } catch (e) {
          showError("invalid JSON file.");
          console.error(e);
        }
      });
  });

  document.getElementById("loadgoal").addEventListener("submit", () => {
    document
      .querySelector("#loadgoal > input:nth-child(1)")
      .files[0].text()
      .then((data) => {
        try {
          let goal = JSON.parse(data);
          for (let conf = 0; conf < goal.length; conf++) {
            if (defaultConfiguration[conf][0] === goal[conf][0]) {
              document.getElementById(goal[conf][0]).value = goal[conf][1];
            } else {
              showError(
                'invalid content in JSON. found "' +
                  goal[conf][0] +
                  '". expected "' +
                  goal[conf][0] +
                  '".',
              );
              return;
            }
          }
        } catch (e) {
          showError("invalid JSON file.");
          console.error(e);
        }
      });
  });

  document.getElementById("saveconfiguration").addEventListener("click", () => {
    let tempConfiguration = [];
    for (let conf = 0; conf < defaultConfiguration.length; conf++) {
      tempConfiguration.push([
        defaultConfiguration[conf][0],
        parseFloat(
          document.getElementById(defaultConfiguration[conf][0]).value,
        ),
      ]);
    }
    let json = JSON.stringify(tempConfiguration);
    let blob = new Blob([json], { type: "text/json" });
    let blobUrl = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = blobUrl;
    link.download = "sceneConfiguration.json";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  });

  document.getElementById("savescene").addEventListener("click", () => {
    let userMod =
      "please put the below in your level description or in an accessible text element in your level.\n";
    for (let conf = 0; conf < defaultConfiguration.length; conf++) {
      if (
        parseFloat(
          document.getElementById(defaultConfiguration[conf][0]).value,
        ) !== defaultConfiguration[conf][1]
      ) {
        userMod +=
          "\n" +
          defaultConfiguration[conf][0] +
          ": " +
          defaultConfiguration[conf][1] +
          " => " +
          document.getElementById(defaultConfiguration[conf][0]).value;
      }
    }
    document.getElementById("usermod").innerText = userMod;

    // aagghh this sucks
    document
      .getElementById("scene")
      .files[0].arrayBuffer()
      .then((sceneBuffer) => {
        let scene = new Uint8Array(sceneBuffer);

        let searchBuffer = new ArrayBuffer(userConfiguration.length * 8);
        let searchView = new DataView(searchBuffer);

        userConfiguration.forEach((conf, i) => {
          searchView.setFloat64(i * 8, conf[1], true);
        });

        let searchByteArray = new Uint8Array(searchBuffer);

        let dataBuffer = new ArrayBuffer(userConfiguration.length * 8);
        let dataView = new DataView(dataBuffer);

        userConfiguration.forEach((conf, i) => {
          dataView.setFloat64(
            i * 8,
            parseFloat(document.getElementById(conf[0]).value),
            true,
          );
        });

        let dataByteArray = new Uint8Array(dataBuffer);
        let modScene = scene;
        let found = 0;
        for (let i = 0; i < scene.length - searchByteArray.length; i++) {
          if (
            JSON.stringify(scene.slice(i, i + searchByteArray.length)) ===
            JSON.stringify(searchByteArray)
          ) {
            found += 1;
            modScene.set(dataByteArray, i);
          }
        }

        if (found === 0) {
          showError(
            "didn't find any instances of the inputs! is your initial config correct?",
          );
        } else if (found === 1) {
          showError(
            "only found 1 instance of the inputs. is your scene corrupted? this is likely ok.",
          );
        } else if (found > 2) {
          showError(
            "found " +
              found +
              " instances of the inputs. watch out, some of your scene may have been deleted!",
          );
        }

        let blob = new Blob([modScene], {
          type: "application/octet-stream",
        });
        let blobUrl = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = blobUrl;
        link.download = "world.scene";
        document.body.append(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(blobUrl);
      });
  });
});
