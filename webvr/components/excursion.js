AFRAME.registerComponent("excursion", {
  schema: {
    target: { type: "selector" },
    edata: { type: "string" },
    empty: { type: "string" },
    modelOpenButton: { type: "string" },
    infoOpen: { type: "string", default: "" },
    infoClose: { type: "string", default: "" },
    backb: { type: "string", default: "" },
    button: { type: "selector" },
    font: { type: "string" },
    linkp: { type: "selector" },
    loader: { type: "selector", default: "#loader" },
  },

  init: function () {
    let data = this.data;
    let scene = document.querySelector("a-scene");

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
      let rotation = elem.rotation + addRot;
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
      }
    });
  },

  getSphereCoordinate: function (la, lo, r) {
    la = (la * Math.PI) / 180;
    lo = (lo * Math.PI) / 180;
    let x = r * Math.sin(lo) * Math.cos(la);
    let y = r * Math.sin(la);
    let z = -r * Math.cos(la) * Math.cos(lo);
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
      let position = { x: 0, y: 0, z: 0 };

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

            position.x = x;
            position.y = y;
            position.z = z;

            points[i] = { x, y, z };

            let entity = document.getElementById("parent_id" + i);
            if (entity) {
              entity.object3D.position.set(x, y, z);
            } else {
              this.createPoint(i, x, y, z, scene);
            }
          }
        }

        // Создание линий после цикла
        for (let j = 0; j < connections.length; j++) {
          let start = connections[j][0];
          let end = connections[j][1];

          // Проверяем существование обеих точек
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
              this.createLine(lineId, points[start], points[end], scene);
            }
          }
        }
      });
    }
  },

  createPoint: function (i, x, y, z, scene) {
    var entity = document.createElement("a-entity");
    entity.setAttribute("id", "parent_id" + i);
    entity.setAttribute("position", `${x} ${y} ${z}`);

    var sphere = document.createElement("a-sphere");
    sphere.setAttribute("radius", i < 21 ? "0.1" : "0.2");
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
