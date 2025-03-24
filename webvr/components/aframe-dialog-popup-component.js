 (function(modules) { 

 	var installedModules = {};


 	function __webpack_require__(moduleId) {


 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}

 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};


 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);


 		module.l = true;


 		return module.exports;
 	}



 	__webpack_require__.m = modules;


 	__webpack_require__.c = installedModules;


 	__webpack_require__.i = function(value) { return value; };


 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};


 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};


 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };


 	__webpack_require__.p = "";


 	return __webpack_require__(__webpack_require__.s = 0);
 })

 ([

 (function(module, exports, __webpack_require__) {

    "use strict";


   
    

    if (typeof AFRAME === 'undefined') {
      throw new Error('Component attempted to register before AFRAME was available.');
    }
    
    
    AFRAME.registerComponent('dialog-popup', {
      schema: {
        titleAlign: {
          default: 'center'
        },
        addAttribute: {
          type: 'string',
          default: 'lal'
        },
        addAttrValue: {
          type: 'string',
          default: ''
        },
        aclass: {
            type: 'string',
            default: 'interractible'
        },
        title: {
          type: 'string',
          default: 'New Dialog'
        },
        titleColor: {
          type: 'string',
          default: 'black'
        },
        titleFont: {
          type: 'string',
          default: 'mozillavr'
        },
        titleWrapCount: {
          type: 'number',
          default: 24
        },
        body: {
          type: 'string',
          default: 'This dialog has no body yet.'
        },
        bodyColor: {
          type: 'string',
          default: 'black'
        },
        bodyFont: {
          type: 'string',
          default: 'mozillavr'
        },
        bodyWrapCount: {
          type: 'number',
          default: 30
        },
        openOn: {
          type: 'string',
          default: 'click'
        },
        active: {
          type: 'boolean',
          default: true
        },
        openIconImage: {
          type: 'string',
          default: ''
        },
        openIconRadius: {
          type: 'number',
          default: 0.35
        },
        openIconColor: {
          type: 'string',
          default: 'white'
        },
        closeIconImage: {
          type: 'asset',
          default: ''
        },
        closeIconRadius: {
          type: 'number',
          default: 0.3
        },
        closeIconColor: {
          type: 'string',
          default: 'white'
        },
        image: {
          type: 'string',
          default: ''
        },
        imageWidth: {
          type: 'number',
          default: 2
        },
        imageHeight: {
          type: 'number',
          default: 2
        },
        dialogBoxWidth: {
          type: 'number',
          default: 8
        },
        dialogBoxHeight: {
          type: 'number',
          default: 10
        },
        dialogBoxColor: {
          type: 'string',
          default: 'white'
        },
        dialogBoxPadding: {
          type: 'number',
          default: 0.4
        }
      },
      multiple: true,
      dialogPlaneEl: null,
      openIconEl: null,
      closeIconEl: null,
      titleEl: null,
      bodyEl: null,
      imageEl: null,
      hasImage: false,
    
      
      init: function init() {
        this.cameraEl = document.querySelector('[camera]');
        this.spawnEntities();
        this.el.emit('loaded');
      },
    
      
      tick: function tick() {
        if (this.isOpen) {
          this.positionDialogPlane();
        }
      },
    
      remove: function remove() {
        var openOn = this.data.openOn;
        this.openIconEl.removeEventListener(openOn, this.toggleDialogOpen.bind(this));
        this.closeIconEl.removeEventListener(openOn, this.toggleDialogOpen.bind(this));
      },
    
     
      update: function update() {
        this.generateTitle();
        this.generateBody();
        this.generateImage();
        this.generateImage(true);
      },
    
      toggleDialogOpen: function toggleDialogOpen() {
        this.isOpen = !this.isOpen;
    
        if (this.data.active && this.dialogPlaneEl) {

          this.dialogPlaneEl.setAttribute('visible', this.isOpen);
          this.openIconEl.setAttribute('visible', !this.isOpen);
          this.isOpen ? this.closeIconEl.classList.add(this.data.aclass) : this.closeIconEl.classList.remove(this.data.aclass);
          let info = document.getElementsByClassName("info");
          for (let i=0; i<info.length; i++) {
            this.isOpen ? info[i].firstElementChild.classList.remove(this.data.aclass) : info[i].firstElementChild.classList.add(this.data.aclass);  
            if (info[i] == this.el)  continue;
            info[i].setAttribute('visible', !this.isOpen)
          }
        }
      },
    

      generateOpenIcon: function generateOpenIcon() {
        var _this$data = this.data,
            radius = _this$data.openIconRadius,
            color = _this$data.openIconColor,
            src = _this$data.openIconImage,
            openOn = _this$data.openOn;
        var openIcon = document.createElement('a-entity');
        if (!this.openIcon) openIcon.classList.add(this.data.aclass);
        openIcon.setAttribute('id', "".concat(this.el.getAttribute('id'), "--open-icon"));
        openIcon.setAttribute('position', Object.assign({}, this.el.getAttribute('position')));
        openIcon.setAttribute('geometry', {
          primitive: 'circle',
          radius: radius
        });
        if (_this$data.addAttribute)
          openIcon.setAttribute(_this$data.addAttribute, this.data.addAttrValue);

        openIcon.setAttribute('material', {
          color: color,
          shader: "flat",
          src: src
        }); 
        this.addAnimation(openIcon);

        var lookAt = this.el.getAttribute('look-at');
    
        if (lookAt) {
          openIcon.setAttribute('look-at', lookAt);
        }
    
        openIcon.addEventListener(openOn, this.toggleDialogOpen.bind(this));
        this.openIconEl = openIcon;
        return openIcon;
      },
    
     
      generateCloseIcon: function generateCloseIcon() {
        var _this$data2 = this.data,
            radius = _this$data2.closeIconRadius,
            color = _this$data2.closeIconColor,
            src = _this$data2.closeIconImage,
            width = _this$data2.dialogBoxWidth,
            height = _this$data2.dialogBoxHeight + _this$data2.imageHeight,
            openOn = _this$data2.openOn;
        var closeIcon = document.createElement('a-entity');

        closeIcon.setAttribute('id', "".concat(this.el.getAttribute('id'), "--close-icon"));
        closeIcon.setAttribute('position', {
          x: width*0.616,
          y: height*0.525,
          z: 0.01
        });
        closeIcon.setAttribute('geometry', {
          primitive: 'plane',
          width: 1.5,
          height: 1.5
        });
        closeIcon.setAttribute('material', {
          color: color,
          shader: "flat",
          transparent: true,
          src: src
        });
        this.addAnimation(closeIcon,1.05);

        closeIcon.addEventListener(openOn, this.toggleDialogOpen.bind(this));
        this.closeIconEl = closeIcon;
        return closeIcon;
      },
    
    
      generateTitle: function generateTitle() {
        var _this$data3 = this.data,
            value = _this$data3.title,
            color = _this$data3.titleColor,
            font = _this$data3.titleFont,
            wrapCount = _this$data3.titleWrapCount,
            width = _this$data3.dialogBoxWidth,
            height = _this$data3.dialogBoxHeight,
            padding = _this$data3.dialogBoxPadding,
            imageHeight = _this$data3.imageHeight;
        var title = this.titleEl || document.createElement('a-entity');
        title.setAttribute('id', "".concat(this.el.getAttribute('id'), "--title"));
        title.setAttribute('text', {
          value: value,

          color: color,
          font: font,
          negate: "false",
          wrapCount: wrapCount,
          width: width - padding * 2,
          baseline: 'top',
          anchor: 'left',
          align: this.data.titleAlign
        });
        var y = height / 2 - padding;
    
        if (this.hasImage) {
          y -= imageHeight / 2;
        }
    
        title.setAttribute('position', {
          x: -(width / 2) + padding,
          y: y,
          z: 0.01
        });
        this.titleEl = title;
        return title;
      },
    

      generateBody: function generateBody() {
        var _this$data4 = this.data,
            value = _this$data4.body,
            color = _this$data4.bodyColor,
            font = _this$data4.bodyFont,
            wrapCount = _this$data4.bodyWrapCount,
            width = _this$data4.dialogBoxWidth,
            height = _this$data4.dialogBoxHeight,
            padding = _this$data4.dialogBoxPadding,
            imageHeight = _this$data4.imageHeight;
        var body = this.bodyEl || document.createElement('a-entity');
        body.setAttribute('id', "".concat(this.el.getAttribute('id'), "--title"));
        body.setAttribute('text', {
          value: value,
          color: color,
          font: font,
          negate: false,
          wrapCount: wrapCount,
          width: width - padding * 2,
          baseline: 'top',
          anchor: 'left'
        });


        var y = height / 2 - padding * 3;
        if (this.data.title.length > this.data.titleWrapCount) {
          y = height / 2 - padding * (2 + Math.round(this.data.title.length/ this.data.titleWrapCount));
        }
    
        if (this.hasImage) {
          y -= imageHeight / 2;
        }
    
        body.setAttribute('position', {
          x: -(width / 2) + padding,
          y: y,
          z: 0.01
        });
        this.bodyEl = body;
        return body;
      },
    

      generateImage: function generateImage(back = false) {
        var _this$data5 = this.data,
            src = _this$data5.image,
            width = _this$data5.imageWidth,
            height = _this$data5.imageHeight,
            dialogBoxHeight = _this$data5.dialogBoxHeight;
    
        if (!src.length) {
          return null;
        }
        let zc = back ? 0.005 : 0.02;
        let w = back ? _this$data5.dialogBoxWidth + _this$data5.dialogBoxPadding : width;
        let s = back ? "" : src;
        var image =  (back ? this.imageElb : this.imageEl)  || document.createElement('a-image');
        image.setAttribute('id', "".concat(this.el.getAttribute('id'), "--image"));
        image.setAttribute('src', s);
        image.setAttribute('width', w);
        image.setAttribute('height', height);
        image.setAttribute('position', {
          x: 0,
          y: dialogBoxHeight / 2,
          z: zc
        });
        this.hasImage = true;
        if (!back)
          this.imageEl = image;
        else 
          this.imageElb = image
        return image;
      },
    

      generateDialogPlane: function generateDialogPlane() {
        var _this$data6 = this.data,
            width = _this$data6.dialogBoxWidth,
            height = _this$data6.dialogBoxHeight + 1.5,
            padding = _this$data6.dialogBoxPadding,
            color = _this$data6.dialogBoxColor;
        var plane = this.dialogPlaneEl || document.createElement('a-entity');
        plane.setAttribute('id', "".concat(this.el.getAttribute('id'), "--dialog-plane"));
        plane.setAttribute('position', Object.assign({}, this.el.getAttribute('position')));
        plane.setAttribute('visible', false);
        plane.setAttribute('geometry', {
          primitive: 'plane',
          width: width + padding,
          height: height + padding
        });
        var image = this.generateImage();
    
        if (image) {
          plane.appendChild(this.generateImage());
          plane.appendChild(this.generateImage(true));
        }
    
        plane.setAttribute('material', {
          shader: "flat",
          color: color
        });
        plane.appendChild(this.generateCloseIcon());
        plane.appendChild(this.generateTitle());
        plane.appendChild(this.generateBody());
        this.dialogPlaneEl = plane;

        
        return plane;
      },
      positionDialogPlane: function positionDialogPlane() {
        if (this.dialogPlaneEl) {
          var vector = this.dialogPlaneEl.object3D.parent.worldToLocal(this.cameraEl.object3D.getWorldPosition());
          var vector2 = this.dialogPlaneEl.object3D.position;
          var vector3 = new THREE.Vector3(vector.x,  vector2.y, vector.z);

          this.dialogPlaneEl.object3D.lookAt(vector3);
          let pi = Math.PI;
          let camr = this.cameraEl.object3D.rotation.y;
          camr = camr % (2 * pi);
          camr = (camr > 0) ? camr : 2 * pi + camr;
          let pp =  this.dialogPlaneEl.object3D.position;
         
          let mvalue = (pp.x > 0 && pp.z > 0) || (pp.x < 0 && pp.z > 0) ? 2 * pi  - camr :  pi + camr
          this.dialogPlaneEl.object3D.rotation.y = mvalue;
          


        }
      },
      spawnEntities: function spawnEntities() {
        this.el.appendChild(this.generateOpenIcon());
        this.el.appendChild(this.generateDialogPlane());
        this.el.removeAttribute('position');
      },

      addAnimation: function(item, maxScale = 1.2)
      {
          item.setAttribute('animation__mouseenter', {
              property: 'scale',
              startEvents: 'mouseenter',
              dur: 200,
              to: maxScale + ' ' + maxScale + ' ' + maxScale
            });
          
          item.setAttribute('animation__mouseleave', {
              property: 'scale',
              startEvents: 'mouseleave',
              dur: 200,
              to: '1 1 1'
            });
  
          item.setAttribute('animation__growup', {
              property: 'scale',
              dur: 1000,
              from: '0 0 0',
              to: '1 1 1'
          });
  
      }
    });
    
     })
     ]);
