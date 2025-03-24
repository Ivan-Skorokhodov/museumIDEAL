AFRAME.registerComponent('camera-look', {
  
    init: function () {
        let camera = this.el.sceneEl.camera;
        this.el.object3D.lookAt(new THREE.Vector3(camera.position.x, camera.position.y + 1.8, camera.position.z));
    }
});
