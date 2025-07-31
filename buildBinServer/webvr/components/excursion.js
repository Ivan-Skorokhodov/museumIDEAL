let palmPrism = null; //голобальная переменная для призмы ладони
AFRAME.registerComponent("excursion", {
  schema: {
    target: { type: "selector" },
    edata: { type: "string" },
    empty: { type: "string" },
    modelOpenButton: { type: "string" },
    infoOpen: { type: "string", default: "" },
    panoOpen: { type: "string", default: "" },
    mapOpen: { type: "string", default: "" },
    map: { type: "string", default: "" },
    infoClose: { type: "string", default: "" },
    rightArrow: { type: "string", default: "" },
    leftArrow: { type: "string", default: "" },
    backb: { type: "string", default: "" },
    button: { type: "selector" },
    font: { type: "string" },
    linkp: { type: "selector" },
    loader: { type: "selector", default: "#loader" },
  },

  init: function () {
    let data = this.data;
    let scene = document.querySelector("a-scene");
    this.grabbedModel = null;

    let connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4], // thumb
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8], // index finger
      [0, 9],
      [9, 10],
      [10, 11],
      [11, 12], // middle finger
      [0, 13],
      [13, 14],
      [14, 15],
      [15, 16], // ring finger
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 20], // pinky
      [5, 9],
      [9, 13],
      [13, 17],
    ];

    this.currentRotation = 0;
    this.autoRotateSpeed = 0;

    let dataCoords = [];
    this.socket = new WebSocket("ws://localhost:8000");

    this.socket.onopen = function () {
      console.log("WebSocket connection established.");
    };

    this.socket.onmessage = (event) => {
      dataCoords = JSON.parse(event.data);
      this.renderHand(dataCoords, connections, scene);
      console.log("Received coordinates:", dataCoords);
    };

    this.socket.onclose = function () {
      console.log("WebSocket connection closed.");
    };

    this.backStack = [];
    let back = this.createPanel(
      "1",
      "1",
      data.backb,
      "-0.7 -2.9 -0.8",
      "-90 0 0",
      "back"
    );
    back.classList.add("interractible");
    this.addAnimation(back);
    data.button.appendChild(back);

    let mapToggle = this.createPanel(
      "0.15",
      "0.11",
      data.mapOpen,
      "1.25 -0.755 -1",
      "0 0 0",
      "map-toggle"
    );
    mapToggle.classList.add("interractible");
    let mapEntity = document.createElement("a-entity");
    mapEntity.setAttribute("id", "map-entity");
    mapEntity.setAttribute("geometry", {
      primitive: "plane",
      width: 1,
      height: 0.75,
    });
    mapEntity.setAttribute("material", {
      src: data.map,
      transparent: true,
    });
    mapEntity.setAttribute("position", "0.97 -0.3 -1");
    mapEntity.setAttribute("visible", false);
    mapEntity.setAttribute("rotation", "0 0 0");
    this.camera = document.querySelector("a-camera");

    this.camera.appendChild(mapEntity);
    this.camera.appendChild(mapToggle);

    mapToggle.addEventListener("click", () => {
      const isVisible = mapEntity.getAttribute("visible");
      mapEntity.setAttribute("visible", !isVisible);
    });

    var x = new XMLHttpRequest();
    x.overrideMimeType("application/json");
    x.open("GET", "webvr/data/" + data.edata + ".json", true);

    x.onreadystatechange = (_) => {
      if (x.readyState == 4 && x.status == "200") {
        this.exdata = JSON.parse(x.responseText);
        let h = window.location.href;
        this.room = h.split("/")[-1];
        if (this.room == "" || !this.exdata.find((a) => a.id == this.room)) {
          this.changeRoom(this.exdata[0].id, 0, false);
        } else {
          this.changeRoom(this.room, 0, true);
        }

        back.addEventListener("click", (_) => {
          if (this.backStack.length > 1) {
            this.backStack.pop();
            this.changeRoom(this.backStack.pop(), 0, true);
          }
        });
      }

      // Создаем координатные оси при инициализации
      this.createAxes();
    };
    x.send(null);
  },

  changeRoom: function (num, addRot, doURL) {
    let loader = this.data.loader;
    loader.setAttribute("visible", true);
    let target = this.data.target;
    let linkp = this.data.linkp;
    let elem = this.exdata.find((a) => a.id == num);
    this.room = num;
    this.backStack.push(num);
    if (doURL) {
      history.pushState({}, "", "#/" + num);
    }
    target.setAttribute("src", elem.url);
    linkp.innerHTML = "";
    target.addEventListener("materialtextureloaded", (_) => {
      target.emit("set-image-fade-out");
      loader.setAttribute("visible", false);
      let rotation = elem.rotation + addRot + this.currentRotation;
      target.setAttribute("rotation", "0 " + rotation + " 0");
      linkp.setAttribute("rotation", "0 " + rotation + " 0");
      linkp.innerHTML = "";
      for (let i = 0; i < elem.transitions.length; i++) {
        let point = document.createElement("a-entity");
        point.setAttribute("camera-look", "");
        point.setAttribute("material", "shader", "flat");
        point.setAttribute("material", "src", this.data.empty);
        point.classList.add("transition");
        point.classList.add("interractible");
        point.setAttribute("geometry", "primitive", "circle");
        point.setAttribute("geometry", "radius", 0.8);
        point.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.transitions[i].latitude,
            elem.transitions[i].longitude,
            elem.transitions[i].radius
          )
        );
        point.addEventListener("click", (_) =>
          this.changeRoom(
            elem.transitions[i].transitionId,
            elem.transitions[i].additionalRotation
          )
        );
        this.addAnimation(point);
        linkp.appendChild(point);
        this.percentText = this.createText(
          point,
          "#006cec",
          "0 0 0.04",
          elem.transitions[i].transitionId
        );
      }

      for (let i = 0; i < elem.model.length; i++) {
        let modelButton = document.createElement("a-entity");
        modelButton.setAttribute("id", "button-" + elem.model[i].id);
        modelButton.setAttribute("camera-look", "");
        modelButton.setAttribute("material", "shader", "flat");
        modelButton.setAttribute("material", "src", this.data.modelOpenButton);
        modelButton.setAttribute("geometry", "primitive", "circle");
        modelButton.setAttribute("geometry", "radius", 0.8);
        modelButton.setAttribute("visible", true);
        modelButton.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.model[i].latitude,
            elem.model[i].longitude,
            elem.model[i].radius
          )
        );
        modelButton.classList.add("interractible");
        linkp.appendChild(modelButton);
        this.addAnimation(modelButton);

        let model = document.createElement("a-entity");
        model.setAttribute("id", elem.model[i].id);
        model.setAttribute("gltf-model", elem.model[i].url);
        model.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.model[i].latitude,
            elem.model[i].longitude,
            elem.model[i].radius
          )
        );
        model.setAttribute("animation", {
          property: "rotation",
          from: "0 0 0",
          to: "0 360 0",
          loop: true,
          dur: 20000,
          easing: "linear",
        });

        model.setAttribute("scale", elem.model[i].scale);
        model.setAttribute("visible", false);
        linkp.appendChild(model);

        let closeButton = document.createElement("a-entity");
        closeButton.setAttribute("id", "close-button-" + elem.model[i].id);
        closeButton.setAttribute("camera-look", "");
        closeButton.setAttribute("material", "shader", "flat");
        closeButton.setAttribute("material", "src", this.data.infoClose);
        closeButton.setAttribute("material", "transparent", 0);
        closeButton.setAttribute("geometry", "primitive", "circle");
        closeButton.setAttribute("geometry", "radius", 0.8);
        closeButton.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.model[i].latitude + 10,
            elem.model[i].longitude + 10,
            elem.model[i].radius
          )
        );
        closeButton.classList.add("interractible");
        closeButton.setAttribute("visible", false);
        this.addAnimation(closeButton);
        linkp.appendChild(closeButton);

        closeButton.addEventListener("click", (_) => {
          model.setAttribute("visible", false);
          closeButton.setAttribute("visible", false);
          modelButton.setAttribute("visible", true);
        });

        modelButton.addEventListener("click", (_) => {
          modelButton.setAttribute("visible", false);
          model.setAttribute("visible", true);
          closeButton.setAttribute("visible", true);
        });
      }

      for (let i = 0; i < elem.info.length; i++) {
        let information = document.createElement("a-entity");
        information.classList.add("info");
        information.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.info[i].latitude,
            elem.info[i].longitude,
            elem.info[i].radius
          )
        );
        information.setAttribute("dialog-popup", {
          openIconImage: this.data.infoOpen,
          closeIconImage: this.data.infoClose,
          title: elem.info[i].title,
          titleColor: "#006cec",
          body: elem.info[i].text,
          titleFont: this.data.font,
          bodyFont: this.data.font,
          addAttribute: "camera-look",
          bodyWrapCount: elem.info[i].bodyWrapCount
            ? elem.info[i].bodyWrapCount
            : 40,
          titleWrapCount: elem.info[i].titleWrapCount
            ? elem.info[i].titleWrapCount
            : 25,
          dialogBoxHeight: elem.info[i].panelHeight
            ? elem.info[i].panelHeight
            : 10,
          dialogBoxWidth: elem.info[i].panelWidth ? elem.info[i].panelWidth : 8,
          image: elem.info[i].image ? elem.info[i].image : "",
          imageWidth: elem.info[i].imageWidth ? elem.info[i].imageWidth : 2,
          imageHeight: elem.info[i].imageHeight ? elem.info[i].imageHeight : 2,
        });
        linkp.appendChild(information);
        /*
        let points = document.querySelectorAll(".transition");
        console.log("Points:", points);
        points.forEach((point) => {
          let position = point.getAttribute("position");
          console.log("Point position:", position);
        });
        */
      }
      for (let i = 0; i < elem.pano.length; i++) {
        let panorama = document.createElement("a-entity");
        panorama.classList.add("pano");

        linkp.appendChild(panorama);
        panorama.setAttribute(
          "position",
          this.getSphereCoordinate(
            elem.pano[i].latitude,
            elem.pano[i].longitude,
            elem.pano[i].radius
          )
        );
        panorama.setAttribute("mini-panorama", {
          openIconImage: this.data.panoOpen,
          closeIconImage: this.data.infoClose,
          rightIconImage: this.data.rightArrow,
          leftIconImage: this.data.leftArrow,
          dialogBoxWidth: elem.pano[i].panelWidth
            ? elem.pano[i].panelWidth
            : 12,
          dialogBoxHeight: elem.pano[i].panelHeight
            ? elem.pano[i].panelHeight
            : 9,
          addAttribute: "camera-look",
          images: elem.pano[i].images ? elem.pano[i].images : [],
        });
      }
    });
    let mapEntity = document.querySelector("#map-entity");
    if (mapEntity) {
      mapEntity.querySelectorAll(".map-point").forEach((e) => e.remove());

      this.exdata.forEach((scene) => {
        let point = document.createElement("a-circle");
        point.setAttribute("radius", 0.025);
        point.setAttribute(
          "color",
          scene.id === this.room ? "#006cec" : "#fff"
        );
        point.classList.add("map-point");
        point.setAttribute("position", scene.mapPosition || "1 0 0");
        point.classList.add("interractible");

        point.addEventListener("click", () => {
          this.changeRoom(scene.id, 0, true);
        });
        mapEntity.appendChild(point);
      });
    }
  },

  getSphereCoordinate: function (la, lo, r) {
    la = (la * Math.PI) / 180;
    lo = (lo * Math.PI) / 180;
    let x = r * Math.sin(lo) * Math.cos(la);
    let y = r * Math.sin(la);
    let z = -r * Math.cos(la) * Math.cos(lo);
    //console.log(x + " " + y + " " + z);
    return x + " " + y + " " + z;
  },

  addAnimation: function (point) {
    point.setAttribute("animation__mouseenter", {
      property: "scale",
      startEvents: "mouseenter",
      dur: 200,
      to: "1.2 1.2 1.2",
    });
    point.setAttribute("animation__mouseleave", {
      property: "scale",
      startEvents: "mouseleave",
      dur: 200,
      to: "1 1 1",
    });
    point.setAttribute("animation__growup", {
      property: "scale",
      dur: 1000,
      from: "0 0 0",
      to: "1 1 1",
    });
  },
  createPanel: function (width, height, image, position, rotation, id) {
    let panel = document.createElement("a-entity");
    panel.setAttribute("material", "shader", "flat");
    panel.setAttribute("id", id);
    panel.setAttribute("geometry", "primitive", "plane");
    panel.setAttribute("geometry", "width", width);
    panel.setAttribute("geometry", "height", height);
    panel.setAttribute("material", "src", image);
    panel.setAttribute("material", "transparent", 0);
    panel.setAttribute("material", "alphaTest", 0.3);
    panel.setAttribute("position", position);
    panel.setAttribute("rotation", rotation);
    panel.setAttribute("animation__growup", {
      property: "scale",
      dur: 500,
      from: "0 0 0",
      to: "1 1 1",
    });
    return panel;
  },
  createText: function (point, color, position, nextRoom) {
    let text = document.createElement("a-entity");
    text.setAttribute("text", {
      value: nextRoom,
      font: this.data.font,
      negate: false,
      color: color,
      wrapCount: 3,
      align: "center",
    });
    text.classList.add(nextRoom);
    text.setAttribute("position", position);
    text.setAttribute("animation__growup", {
      property: "scale",
      dur: 500,
      from: "0 0 0",
      to: "1 1 1",
    });
    point.appendChild(text);
    return text;
  },

  renderHand: function (data, connections, scene) {
    if (data !== null) {
      let points = [];
      requestAnimationFrame(() => {
        for (let i = 0; i < 22; i++) {
          if (
            data["x" + i] !== undefined &&
            data["y" + i] !== undefined &&
            data["z" + i] !== undefined
          ) {
            let x = parseFloat(data["x" + i]);
            let y = parseFloat(data["y" + i]);
            let z = parseFloat(data["z" + i]);
            console.log(i, x, y, z);

            let camera = document.querySelector("[camera]");

            let cameraEl = camera.object3D;
            let cameraDirection = new THREE.Vector3();
            cameraEl.getWorldDirection(cameraDirection);

            let angle = -Math.atan2(cameraDirection.x, cameraDirection.z);

            let cos = Math.cos(angle);
            let sin = Math.sin(angle);

            let rotatedX = x * cos - z * sin;
            let rotatedZ = x * sin + z * cos;
            let rotatedY = y;

            x = rotatedX;
            y = rotatedY;
            z = rotatedZ;

            points[i] = { x, y, z };

            let entity = document.getElementById("parent_id" + i);
            if (entity) {
              entity.object3D.position.set(x, y, z);
            } else {
              this.createPoint(i, x, y, z, scene);
            }
            if (i === 8) {
              let xHand = x;

              if (xHand > 10) {
                this.autoRotateSpeed = 0.5;
              } else if (xHand < -10) {
                this.autoRotateSpeed = -0.5;
              } else {
                this.autoRotateSpeed = 0;
              }

              this.rotateScene();
              let pointButtons = document.querySelectorAll(".interractible");
              let pointEntity = document.getElementById("parent_id" + i);

              console.log("Все кнопки здесь ", pointButtons);

              for (let j = 0; j < pointButtons.length; j++) {
                let button = pointButtons[j];
                this.checkClick(pointEntity, button);
              }
            }
            if (i < 21 && i > 1 && !(i == 17 || i == 13 || i == 9 || i == 5)) {
              this.finger_model(i, points);
            }
          }
        }

        //----------------------загружаеттся модель ладони-----------------------------
        let palmModel = document.getElementById("palm-model");

        if (palmModel && points[0] && points[5] && points[9] && points[17]) {
          // высчитка центра ладони
          let selectedIndices = [0, 1, 5, 9, 13, 17];

          let sumX = 0,
            sumY = 0,
            sumZ = 0;
          selectedIndices.forEach((i) => {
            sumX += points[i].x;
            sumY += points[i].y;
            sumZ += points[i].z;
          });

          let count = selectedIndices.length;
          let centerX = sumX / count;
          let centerY = sumY / count;
          let centerZ = sumZ / count;
          palmModel.object3D.position.set(centerX, centerY, centerZ);
          palmModel.setAttribute("visible", "true");

          let xAxis = new THREE.Vector3()
            .subVectors(
              new THREE.Vector3(points[5].x, points[5].y, points[5].z),
              new THREE.Vector3(points[17].x, points[17].y, points[17].z)
            )
            .normalize();

          let yAxis = new THREE.Vector3()
            .subVectors(
              new THREE.Vector3(points[9].x, points[9].y, points[9].z),
              new THREE.Vector3(points[0].x, points[0].y, points[0].z)
            )
            .normalize();

          let zAxis = new THREE.Vector3()
            .crossVectors(xAxis, yAxis)
            .normalize();

          xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();

          let handMatrix = new THREE.Matrix4();
          handMatrix.makeBasis(xAxis, yAxis, zAxis);

          //это поворот-----------
          // Исходный поворот (из матрицы ориентации)
          let quaternion = new THREE.Quaternion().setFromRotationMatrix(
            handMatrix
          );

          // Кватернионы для дополнительных вращений
          let qY = new THREE.Quaternion();
          let qX = new THREE.Quaternion();
          let qZ = new THREE.Quaternion();

          // Установить повороты по осям (в градусах)
          qY.setFromAxisAngle(
            new THREE.Vector3(0, 1, 0),
            THREE.Math.degToRad(10)
          );
          qX.setFromAxisAngle(
            new THREE.Vector3(1, 0, 0),
            THREE.Math.degToRad(0)
          );
          qZ.setFromAxisAngle(
            new THREE.Vector3(0, 0, 1),
            THREE.Math.degToRad(5)
          );

          // Объединяем все повороты (в нужном порядке!)
          quaternion.multiply(qY); // сначала Y
          quaternion.multiply(qX); // потом X
          quaternion.multiply(qZ); // потом Z

          // Применяем результат
          palmModel.object3D.quaternion.copy(quaternion);

          //-------------------------------

          // let quaternion = new THREE.Quaternion().setFromRotationMatrix(handMatrix);

          // palmModel.object3D.quaternion.copy(quaternion);

          let wristToPalm = new THREE.Vector3()
            .subVectors(
              new THREE.Vector3(points[9].x, points[9].y, points[9].z),
              new THREE.Vector3(points[0].x, points[0].y, points[0].z)
            )
            .length();

          let palmWidth = new THREE.Vector3()
            .subVectors(
              new THREE.Vector3(points[5].x, points[5].y, points[5].z),
              new THREE.Vector3(points[17].x, points[17].y, points[17].z)
            )
            .length();

          palmModel.object3D.scale.set(wristToPalm / 9.5, palmWidth / 6, 0.2);
        }
        //------------конец модели ладони--------------------------------

        //this.palm_model(points);
        //this.renderPalmPrism(points, scene);

        for (let j = 0; j < connections.length; j++) {
          let start = connections[j][0];
          let end = connections[j][1];

          if (points[start] && points[end]) {
            let lineId = "line_" + start + "_" + end;
            let lineEl = document.getElementById(lineId);

            if (lineEl) {
              lineEl.setAttribute("line", {
                start: `${points[start].x} ${points[start].y} ${points[start].z}`,
                end: `${points[end].x} ${points[end].y} ${points[end].z}`,
                color: "#00FF00",
                width: 0.2,
              });
            } else {
              //this.createLine(lineId, points[start], points[end], scene);
            }
          }
        }

        //----------------переснос 3д моделей кулаком----------------------
        let isFist = this.isFist(points);
        if (isFist && !this.grabbedModel) {
          let visibleModels = document.querySelectorAll("a-entity[id='model']");
          let palmPos = points[0];
          //console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", visibleModels);
          visibleModels.forEach((model) => {
            if (model.id.startsWith("button") || model.id.startsWith("close"))
              return;
            const modelPos = new THREE.Vector3();
            model.object3D.getWorldPosition(modelPos);

            const dist = Math.sqrt(
              (palmPos.x - modelPos.x) ** 2 +
                (palmPos.y - modelPos.y) ** 2 +
                (palmPos.z - modelPos.z) ** 2
            );
            //console.log("BBBBBBBBB", modelPos, points[0]);
            if (dist < 2.0) {
              this.grabbedModel = model;
            }
          });
        } else if (!isFist && this.grabbedModel) {
          this.grabbedModel = null;
        }

        if (this.grabbedModel && points[0]) {
          this.grabbedModel.object3D.position.set(
            -points[0].x,
            points[0].y,
            -points[0].z
          );
        }
        //--------------коннец переноса 3д модели кулаком------------------------------
      });
    }
  },

  finger_model: function (i, points) {
    let name = "finger" + i.toString() + "-model";
    let model = document.getElementById(name);
    if (model) {
      model.setAttribute("visible", "true");

      model.object3D.position.set(
        (points[i].x + points[i - 1].x) / 2,
        (points[i].y + points[i - 1].y) / 2,
        (points[i].z + points[i - 1].z) / 2
      );

      if (points[i - 1]) {
        let from = new THREE.Vector3(points[i].x, points[i].y, points[i].z);
        let to = new THREE.Vector3(
          points[i - 1].x,
          points[i - 1].y,
          points[i - 1].z
        );

        let direction = new THREE.Vector3().subVectors(to, from).normalize();

        let up = new THREE.Vector3(0, -1, 0);
        let quaternion = new THREE.Quaternion().setFromUnitVectors(
          up,
          direction
        );
        model.object3D.quaternion.copy(quaternion);

        let length = from.distanceTo(to);

        model.setAttribute("scale", `0.05 ${length / 12} 0.05`);
      }
    }
  },

  palm_model: function (points) {
    let model = document.getElementById("palm-model");
    if (!model || !points || points.length < 18) return;

    let p0 = points[0],
      p5 = points[5],
      p9 = points[9],
      p17 = points[17],
      p13 = points[13];
    if (!(p0 && p5 && p9 && p17)) return;

    model.setAttribute("visible", "true");

    let cx = (p0.x + p13.x) / 2;
    let cy = (p0.y + p13.y) / 2;
    let cz = (p0.z + p13.z) / 2;
    model.object3D.position.set(cx, cy, cz);

    let v1 = new THREE.Vector3(p9.x - p0.x, p9.y - p0.y, p9.z - p0.z);
    let v2 = new THREE.Vector3(p17.x - p5.x, p17.y - p5.y, p17.z - p5.z);
    if (v1.length() < 1e-5 || v2.length() < 1e-5) return;

    v1.normalize();
    v2.normalize();

    let v3 = new THREE.Vector3().crossVectors(v1, v2).normalize();
    v2 = new THREE.Vector3().crossVectors(v3, v1).normalize();

    if (v3.length() < 1e-5) return;

    let matrix = new THREE.Matrix4().makeBasis(v2, v1, v3);
    model.object3D.setRotationFromMatrix(matrix);

    let width = new THREE.Vector3(
      p17.x - p5.x,
      p17.y - p5.y,
      p17.z - p5.z
    ).length();
    let height = new THREE.Vector3(
      p9.x - p0.x,
      p9.y - p0.y,
      p9.z - p0.z
    ).length();
    let thickness = 0.03;

    model.setAttribute("scale", `${width / 1.3} ${height / 2} ${thickness}`);

    let handModel = document.getElementById("palm-model");
    if (handModel) {
      handModel.object3D.position.copy(model.object3D.position);
      handModel.object3D.quaternion.copy(model.object3D.quaternion);
    }
  },

  renderPalmPrism: function (points, scene) {
    const indices = [0, 1, 2, 5, 9, 13, 17];
    if (indices.some((i) => !points[i])) return;

    if (palmPrism) {
      scene.object3D.remove(palmPrism);
      palmPrism.geometry.dispose();
      palmPrism.material.dispose();
      palmPrism = null;
    }

    const topVertices = indices.map(
      (i) => new THREE.Vector3(points[i].x, points[i].y, points[i].z)
    );
    const thickness = 0.3;
    const bottomVertices = topVertices.map(
      (v) => new THREE.Vector3(v.x, v.y - thickness, v.z)
    );

    const vertices = [...topVertices, ...bottomVertices];

    const faceIndices = [];
    const n = indices.length;

    for (let i = 1; i < n - 1; i++) {
      faceIndices.push(0, i, i + 1);
    }

    for (let i = 1; i < n - 1; i++) {
      faceIndices.push(n, n + i, n + i + 1);
    }

    for (let i = 0; i < n; i++) {
      const next = (i + 1) % n;
      faceIndices.push(i, n + next, next);
      faceIndices.push(i, n + i, n + next);
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(vertices.length * 3);
    for (let i = 0; i < vertices.length; i++) {
      positions[i * 3] = vertices[i].x;
      positions[i * 3 + 1] = vertices[i].y;
      positions[i * 3 + 2] = vertices[i].z;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setIndex(faceIndices);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0xa0a0a0,
      metalness: 0,
      roughness: 1,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide,
    });
    palmPrism = new THREE.Mesh(geometry, material);
    scene.object3D.add(palmPrism);
  },

  isFist: function (points) {
    const tipIndices = [4, 8, 12, 16, 20];
    const wrist = points[0];
    if (!wrist) return false;

    let closed = 0;
    for (let i = 0; i < tipIndices.length; i++) {
      const tip = points[tipIndices[i]];
      if (!tip) continue;

      const dist = Math.sqrt(
        (wrist.x - tip.x) ** 2 + (wrist.y - tip.y) ** 2 + (wrist.z - tip.z) ** 2
      );

      if (dist < 2) closed++;
    }

    return closed >= 4;
  },

  rotateScene: function () {
    if (!this.data.target || !this.data.linkp) return;

    this.currentRotation += this.autoRotateSpeed;
    this.data.target.setAttribute("rotation", `0 ${this.currentRotation} 0`);
    this.data.linkp.setAttribute("rotation", `0 ${this.currentRotation} 0`);
  },

  createPoint: function (i, x, y, z, scene) {
    var entity = document.createElement("a-entity");
    entity.setAttribute("id", "parent_id" + i);
    entity.setAttribute("position", `${x} ${y} ${z}`);

    var sphere = document.createElement("a-sphere");
    sphere.setAttribute("radius", i < 21 ? "0.001" : "0.002");
    sphere.setAttribute("color", i < 21 ? "#483D8B" : "#FF0000");
    sphere.setAttribute("position", "0 0 0");

    var text = document.createElement("a-text");
    text.setAttribute("id", "text_id" + i);
    text.setAttribute("value", "");
    text.setAttribute("color", "#FFFFFF");
    text.setAttribute("position", "0.125 0 0");

    entity.appendChild(sphere);
    entity.appendChild(text);

    scene.appendChild(entity);
  },

  createLine: function (id, start, end, scene) {
    if (
      !start ||
      !end ||
      typeof start.x === "undefined" ||
      typeof end.x === "undefined"
    ) {
      console.error("Некорректные координаты для линии:", start, end);
      return;
    }

    var lineEl = document.createElement("a-entity");
    lineEl.setAttribute("id", id);
    lineEl.setAttribute("line", {
      start: `${start.x} ${start.y} ${start.z}`,
      end: `${end.x} ${end.y} ${end.z}`,
      color: "#00FF00",
      width: 0.2,
    });
    scene.appendChild(lineEl);
  },

  checkClick: function (point, button) {
    if (!point?.object3D || !button?.object3D) {
      console.warn("object3D не инициализирован", point, button);
      return;
    }

    const pointWorldPos = new THREE.Vector3();
    const buttonWorldPos = new THREE.Vector3();

    button.object3D.getWorldPosition(buttonWorldPos);
    point.object3D.getWorldPosition(pointWorldPos);

    console.log("Глобальные координаты точки:", pointWorldPos);
    console.log("Глобальные координаты кнопки:", buttonWorldPos);

    const distance = pointWorldPos.distanceTo(buttonWorldPos);
    console.log("Расстояние между точкой и кнопкой:", distance);

    if (distance < 2) {
      console.log("Клик сгенерирован!");
      button.emit("click");
    }
  },

  createAxes: function () {
    var scene = document.querySelector("a-scene");

    // Ось X (красная)
    var xAxis = document.createElement("a-entity");
    xAxis.setAttribute("line", {
      start: "-40 0 0",
      end: "40 0 0",
      color: "red",
    });
    scene.appendChild(xAxis);

    // Ось Y (зелёная)
    var yAxis = document.createElement("a-entity");
    yAxis.setAttribute("line", {
      start: "0 -40 0",
      end: "0 40 0",
      color: "green",
    });
    scene.appendChild(yAxis);

    // Ось Z (синяя)
    var zAxis = document.createElement("a-entity");
    zAxis.setAttribute("line", {
      start: "0 0 -40",
      end: "0 0 40",
      color: "blue",
    });
    scene.appendChild(zAxis);

    for (let i = -40; i <= 40; i++) {
      if (i === 0) continue; // Пропустить 0, т.к. уже есть начало оси
      var textX = document.createElement("a-text");
      textX.setAttribute("value", i.toString());
      textX.setAttribute("color", "#FFFFFF");
      textX.setAttribute("position", { x: i, y: 0.2, z: 0 });
      scene.appendChild(textX);
    }

    // Добавляем текстовые метки на оси Y
    for (let i = -40; i <= 40; i++) {
      if (i === 0) continue;
      var textY = document.createElement("a-text");
      textY.setAttribute("value", i.toString());
      textY.setAttribute("color", "#FFFFFF");
      textY.setAttribute("position", { x: 0, y: i, z: 0 });
      scene.appendChild(textY);
    }

    // Добавляем текстовые метки на оси Z
    for (let i = -40; i <= 40; i++) {
      if (i === 0) continue;
      var textZ = document.createElement("a-text");
      textZ.setAttribute("value", i.toString());
      textZ.setAttribute("color", "#FFFFFF");
      textZ.setAttribute("position", { x: 0, y: 0, z: i });
      scene.appendChild(textZ);
    }
  },
});
