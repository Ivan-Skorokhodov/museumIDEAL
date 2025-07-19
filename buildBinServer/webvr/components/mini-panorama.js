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

   AFRAME.registerComponent('mini-panorama', {
     schema: {
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
       arrowIconRadius: {
         type: 'number',
         default: 0.7
       },
       arrowIconColor: {
         type: 'string',
         default: 'white'
       },
       rightIconImage: {
         type: 'asset',
         default: ''
       },
       leftIconImage: {
         type: 'asset',
         default: ''
       },
       images: {
         type: 'array',
         default: []
       },
       dialogBoxWidth: {
         type: 'number',
         default: 12
       },
       dialogBoxHeight: {
         type: 'number',
         default: 9
       },
       dialogBoxColor: {
         type: 'string',
         default: 'white'
       },
       dialogBoxPadding: {
         type: 'number',
         default: 0.8
       }
     },
     multiple: true,
     dialogPlaneEl: null,
     openIconEl: null,
     closeIconEl: null,
     rightIconEl: null,
     leftIconEl: null,
     imageEl: null,


     init: function() {
       this.camera = document.querySelector('[camera]');
       this.currentImageIndex = 0;
       this.setupDialog();
     },


   setupDialog: function() {
     this.el.appendChild(this.generateOpenIcon());

     this.overlay = this.generateOverlay();
     this.camera.appendChild(this.overlay);

     this.dialog = this.generateDialogPlane();
     this.camera.appendChild(this.dialog);
     this.dialog.setAttribute('visible', false);
   },


     remove: function remove() {
       var openOn = this.data.openOn;
       this.openIconEl.removeEventListener(openOn, this.toggleDialogOpen.bind(this));
       this.closeIconEl.removeEventListener(openOn, this.toggleDialogOpen.bind(this));
     },


     update: function update() {
       this.generateImage();
       this.generateImage(true);
     },


    toggleDialogOpen: function() {
     this.isOpen = !this.isOpen;

     if (this.data.active && this.dialogPlaneEl) {
       this.dialogPlaneEl.setAttribute('visible', this.isOpen);
       this.overlay.setAttribute('visible', this.isOpen);
       this.openIconEl.setAttribute('visible', !this.isOpen);

       this.isOpen ? this.closeIconEl.classList.add(this.data.aclass)
                  : this.closeIconEl.classList.remove(this.data.aclass);

       let pano = document.getElementsByClassName("pano");
       for (let i=0; i<pano.length; i++) {
         this.isOpen ? pano[i].firstElementChild.classList.remove(this.data.aclass)
                    : pano[i].firstElementChild.classList.add(this.data.aclass);
         if (pano[i] == this.el) continue;
         pano[i].setAttribute('visible', !this.isOpen);
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
           height = _this$data2.dialogBoxHeight,
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


     generateImage: function generateImage(back = false) {
       var _this$data5 = this.data,
           images = _this$data5.images,
           width = _this$data5.dialogBoxWidth,
           height = _this$data5.dialogBoxHeight,
           dialogBoxHeight = _this$data5.dialogBoxHeight;

       if (!images.length) {
         return null;
       }
       let zc = back ? 0.005 : 0.02;
       let w = back ? _this$data5.dialogBoxWidth + _this$data5.dialogBoxPadding : width;
       let s = images[this.currentImageIndex];
       var image =  (back ? this.imageElb : this.imageEl)  || document.createElement('a-image');
       image.setAttribute('id', "".concat(this.el.getAttribute('id'), this.currentImageIndex));
       image.setAttribute('src', s);
       image.setAttribute('width', width);
       image.setAttribute('height', height);
       image.setAttribute('position', {
         x: 0,
         y: 0,
         z: zc
       });
       this.hasImage = true;
       if (!back)
         this.imageEl = image;
       else
         this.imageElb = image;
       return image;
     },


     generateDialogPlane: function generateDialogPlane() {
       var _this$data6 = this.data,
           width = _this$data6.dialogBoxWidth,
           height = _this$data6.dialogBoxHeight,
           padding = _this$data6.dialogBoxPadding,
           color = _this$data6.dialogBoxColor;


       var plane = this.dialogPlaneEl || document.createElement('a-entity');
       plane.setAttribute('id', "".concat(this.el.getAttribute('id'), "--dialog-plane"));
       plane.setAttribute('position', "0 2 -8");
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
       plane.appendChild(this.generateArrow('left'));
       plane.appendChild(this.generateArrow('right'));

       this.dialogPlaneEl = plane;

       return plane;
     },


     generateArrow: function(direction) {
        var _this$data3 = this.data,
           radius = _this$data3.arrowIconRadius,
           color = _this$data3.arrowIconColor,
           right = _this$data3.rightIconImage,
           left = _this$data3.leftIconImage,
           width = _this$data3.dialogBoxWidth,
           height = _this$data3.dialogBoxHeight;

       var posX = direction === 'left' ? -1 : 1;
       var src = direction === 'left' ? left : right;
       var arrowButton = document.createElement('a-entity');

       arrowButton.setAttribute('id', "".concat(this.el.getAttribute('id'), direction));
       arrowButton.setAttribute('position', {
         x: posX*width*0.616,
         y: 0,
         z: 0.01
       });
       arrowButton.setAttribute('geometry', {
         primitive: 'circle',
         radius: radius
       });
       arrowButton.setAttribute('material', {
         color: color,
         shader: "flat",
         transparent: true,
         src: src
       });
       this.addAnimation(arrowButton, 1.05);

        arrowButton.classList.add(this.data.aclass);
        arrowButton.addEventListener('click', () => {
            this.changeImage(direction === 'left' ? -1 : 1);
        });

       if (direction == 'left')
            this.leftIconEl = arrowButton;
       else
            this.rightIconEl = arrowButton;

       return arrowButton;
     },


    generateRightArrow: function generateRightArrow() {
        var _this$data3 = this.data,
           radius = _this$data3.arrowIconRadius,
           color = _this$data3.arrowIconColor,
           right = _this$data3.rightIconImage,
           width = _this$data3.dialogBoxWidth,
           height = _this$data3.dialogBoxHeight;

       var posX = 1
       var src = right;
       var rightArrowButton = document.createElement('a-entity');

       rightArrowButton.setAttribute('id', "".concat(this.el.getAttribute('id'), '--right'));
       rightArrowButton.setAttribute('position', {
         x: posX*width*0.616,
         y: 0,
         z: 0.01
       });
       rightArrowButton.setAttribute('geometry', {
         primitive: 'circle',
         radius: radius
       });
       rightArrowButton.setAttribute('material', {
         color: color,
         shader: "flat",
         transparent: true,
         src: src
       });
       this.addAnimation(rightArrowButton, 1.05);

        rightArrowButton.addEventListener('click', () => {
            this.changeImage(1);
        });

       this.rightIconEl = rightArrowButton;

       return rightArrowButton;
     },

     changeImage: function(direction) {
        let total = this.data.images.length;
        if (total === 0) return;

        this.currentImageIndex = (this.currentImageIndex + direction + total) % total;

        var newSrc = this.data.images[this.currentImageIndex];
        if (this.imageEl) {
            this.imageEl.setAttribute('src', newSrc);
        }
    },


     generateOverlay: function generateOverlay() {
         var overlay = document.createElement('a-entity');
         overlay.setAttribute('geometry', {
           primitive: 'plane',
           width: 100,
           height: 100
         });
         overlay.setAttribute('material', {
           color: 'black',
           opacity: 0.5,
           transparent: true
         });
         overlay.setAttribute('position', '0 0 -10');
         overlay.setAttribute('visible', false);
         return overlay;
     },



    addAnimation: function(item, maxScale = 1.2) {
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

