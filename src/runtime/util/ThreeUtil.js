
var ThreeUtil = {

  createTexture: function(img, props) {

    // Create texture and register a listener when it's loaded
    var tex = new THREE.Texture(img);
    img.addEventListener('load', function() {
      tex.needsUpdate = true;
    });

    // In most of the cases we want to wrap, so default to wrapping
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapS = THREE.RepeatWrapping;

    // Add default props
    if (props) {
      Object.keys(props).forEach(function(prop) {
        tex[prop] = props[prop];
      });
    }

    return tex;
  }

};

module.exports = ThreeUtil;
