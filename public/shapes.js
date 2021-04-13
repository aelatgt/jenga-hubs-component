// import "https://unpkg.com/aframe-gradient-sky@1.0.4/dist/gradientsky.min.js";

/*
function registerComponents() {
  AFRAME.registerComponent('change-color-on-hover', {
    schema: {
      color: {default: 'red'}
    },

    init: function () {
      var data = this.data;
      var el = this.el;  // <a-box>
      var defaultColor = el.getAttribute('material').color;

      el.addEventListener('mouseenter', function () {
        el.setAttribute('color', data.color);
      });

      el.addEventListener('mouseleave', function () {
        el.setAttribute('color', defaultColor);
      });
    }
  });
}
*/

function inject_createInteractiveBall() {
				
	//Query assets in order to setup template
	let assets = document.querySelector("a-assets");
	// create a new template variable
	let newTemplate = document.createElement("template");
	// create template id
	newTemplate.id = "interactable-ball-media";
	// create a new entity for the template so we can append it to the assets later
	// normally this is done in the Hubs.html "bootstrap" file
	let newEntity = document.createElement("a-entity");
				
	// setup the attributes for the template such and class and components that
	// should be associated with the template entities
				
	// set the class to interactable if you want interaction or some other class
	// based on hubs interaction layers
	newEntity.setAttribute("class", "interactable");
				
	// for attributes with multiple objects in the schema it's easier to setup
	// a varibable to hold the attribute and its values then create the node on
	// the entity
				
	// the body helper component allows you to setup dynamic attributes for physics
	// interactions.  the type can be dynamic or static.  collision filters and
	// masks are used to limit what objects can collide with.  See the body-helper
	// component for more information
	let bh = document.createAttribute("body-helper");
	bh.value = "type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 15;";
	newEntity.setAttributeNode(bh);
				
	// An object needs to have geometry in order to be visible and work with physics
	// here we reuse the bh variable since the body helper node has been added to the entity.  In this case we are creating the geometry attribute (see aframe docs)
	bh = document.createAttribute("geometry");
	// create a sphere geometry with a radius of 0.5 meters
	//- bh.value = "primitive: sphere; radius: 0.5";
  bh.value = "primitive: cylinder; radius: 0.25; height: 2;";
	newEntity.setAttributeNode(bh);
				
  
	// reuse the same bh variable for a material attribute to color the geometry
	bh = document.createAttribute("material");
	// set the color to yellow.  You can set a lot of things here, texture, shininess etc.  See the aframe docs on materials
	bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  // bh.value += "emissive: #888888; emissiveIntensity: 1;";
  // bh.value = "shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210";
	newEntity.setAttributeNode(bh);
  
  /*
  // this part relies on the a-cursor component to already work good
  // change-color-on-hover="color: blue"
  bh = document.createAttribute("change-color-on-hover");
	// set the color to yellow.  You can set a lot of things here, texture, shininess etc.  See the aframe docs on materials
	bh.value = "color: blue";
  // bh.value = "shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210";
	newEntity.setAttributeNode(bh);
  */
  
				
	// set the unowned body kinematic component for the object since it's networked
	// and physics related.
	newEntity.setAttribute("set-unowned-body-kinematic", "");
	// sets the remote hover target component on the object
	newEntity.setAttribute("is-remote-hover-target", "");
				
	// the tags component allows you to filter the collisions and interactable
	// qualities of the entity.  We can reuse bh to set all it's values
	bh = document.createAttribute("tags")
	// set it to be a hand collision target, holdable, give it a hand constraint, a remote constraint, and set to be inspectable with a right click.
	bh.value = "isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; inspectable: true;";
	newEntity.setAttributeNode(bh);
				
	// you can set the objects to be destroyed at extreme distances in order to avoid having a bunch of hard to find physics objects falling in your hub
	newEntity.setAttribute("destroy-at-extreme-distances", "");
	// sets whether the object can be scaled when you grab it. Check hubs docs or the component to see how it can be scaled in different modes
	newEntity.setAttribute("scalable-when-grabbed", "");
				// another component setup.  Check it out in the components in src
	newEntity.setAttribute("set-xyz-order", "");
	// important! since the matrix auto update on objects in turned off by default
	// in order to save compute power
	newEntity.setAttribute("matrix-auto-update", "");
	// whether this object has a hoverable visuals interaction. You may have to add additional child entities to the template to get this to show up.  Check the component to see how it works 
	newEntity.setAttribute("hoverable-visuals", "");

	// Important!  This Component helps you set the collision shape for the object
	// without it set on the actual entity which contains the mesh (set with the 
	// geometry component above in this case) the physics won't collide and the 
	// object will fall through the ground.  Check the component for details
	bh = document.createAttribute("shape-helper")
	bh.value = "";
	newEntity.setAttributeNode(bh);
				
	//add the listed-media component
	newEntity.setAttribute("listed-media", "");
	
	//add the camera-cube-env component
	newEntity.setAttribute("camera-cube-env", "");
				
	//Once all the attributes are setup on the entity you can append it to the template variable content created above.
	newTemplate.content.appendChild(newEntity);
				
	// once the template is created you append it to the assets
	assets.appendChild(newTemplate);
				
				
	//	This sets up an update function for how often each networked entity needs to update
	// position, rotation, or scale based on each transforms setting in the NAF schema.
	// I'm not sure why it's not a utility function in NAF?
	const vectorRequiresUpdate = epsilon => {
		return () => {
			let prev = null;

			return curr => {
				if (prev === null) {
					prev = new THREE.Vector3(curr.x, curr.y, curr.z);
					return true;
				} else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
					prev.copy(curr);
					return true;
				}

				return false;
			};
		};
	};

	// Add the new schema to NAF. and declare the networked components and their update 
	// sensitivity using the function above if they modify the transforms.
	NAF.schemas.add({
		template: "#interactable-ball-media",
		components: [
			{
				component: "position",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			{
				component: "rotation",
				requiresNetworkUpdate: vectorRequiresUpdate(0.5)
			},
			{
				component: "scale",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			"media-loader",
			"material",
			"pinnable"
		]
	});
		
}



function inject_shapeType(json, id) {
				
	//Query assets in order to setup template
	let assets = document.querySelector("a-assets");
	// create a new template variable
	let newTemplate = document.createElement("template");
	// create template id
	// newTemplate.id = "interactable-ball-media-2";
  newTemplate.id = id;
	// create a new entity for the template so we can append it to the assets later
	// normally this is done in the Hubs.html "bootstrap" file
	let newEntity = document.createElement("a-entity");
				
	// setup the attributes for the template such and class and components that
	// should be associated with the template entities
				
	// set the class to interactable if you want interaction or some other class
	// based on hubs interaction layers
	newEntity.setAttribute("class", "interactable");
				
	// for attributes with multiple objects in the schema it's easier to setup
	// a varibable to hold the attribute and its values then create the node on
	// the entity
				
	// the body helper component allows you to setup dynamic attributes for physics
	// interactions.  the type can be dynamic or static.  collision filters and
	// masks are used to limit what objects can collide with.  See the body-helper
	// component for more information
	let bh = document.createAttribute("body-helper");
	bh.value = "type: dynamic; mass: 1; collisionFilterGroup: 1; collisionFilterMask: 15;";
	newEntity.setAttributeNode(bh);
				
	// An object needs to have geometry in order to be visible and work with physics
	// here we reuse the bh variable since the body helper node has been added to the entity.  In this case we are creating the geometry attribute (see aframe docs)
	/*
  bh = document.createAttribute("geometry");
	// create a sphere geometry with a radius of 0.5 meters
	//- bh.value = "primitive: sphere; radius: 0.5";
  bh.value = "primitive: cylinder; radius: 0.25; height: 2;";
	newEntity.setAttributeNode(bh);
  */
  for (var key in json) {
    var value = json[key];
    var childProperties = "";
    // childProperties = JSON.stringify(value);
    childProperties = (
      Object.entries(value).map(([k, v]) => `${k}:${v}`).join(';')
    );
    // may need to remove the parenthesis from the stringified json
    /*
    for (var subkey in value) {
      var subvalue = value[subkey];
      childProperties += subValue;
    }
    */
    console.log(childProperties);
    var attribute = document.createAttribute(key);
    attribute.value = childProperties;
    newEntity.setAttributeNode(attribute);
  }
				
  
  /*
	// reuse the same bh variable for a material attribute to color the geometry
	bh = document.createAttribute("material");
	// set the color to yellow.  You can set a lot of things here, texture, shininess etc.  See the aframe docs on materials
	bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  // bh.value += "emissive: #888888; emissiveIntensity: 1;";
  // bh.value = "shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210";
	newEntity.setAttributeNode(bh);
  */
  
  /*
  // this part relies on the a-cursor component to already work good
  // change-color-on-hover="color: blue"
  bh = document.createAttribute("change-color-on-hover");
	// set the color to yellow.  You can set a lot of things here, texture, shininess etc.  See the aframe docs on materials
	bh.value = "color: blue";
  // bh.value = "shader: gradient; topColor: 235 235 245; bottomColor: 185 185 210";
	newEntity.setAttributeNode(bh);
  */
  
				
	// set the unowned body kinematic component for the object since it's networked
	// and physics related.
	newEntity.setAttribute("set-unowned-body-kinematic", "");
	// sets the remote hover target component on the object
	newEntity.setAttribute("is-remote-hover-target", "");
				
	// the tags component allows you to filter the collisions and interactable
	// qualities of the entity.  We can reuse bh to set all it's values
	bh = document.createAttribute("tags")
	// set it to be a hand collision target, holdable, give it a hand constraint, a remote constraint, and set to be inspectable with a right click.
	bh.value = "isHandCollisionTarget: true; isHoldable: true; offersHandConstraint: true; offersRemoteConstraint: true; inspectable: true;";
	newEntity.setAttributeNode(bh);
				
	// you can set the objects to be destroyed at extreme distances in order to avoid having a bunch of hard to find physics objects falling in your hub
	newEntity.setAttribute("destroy-at-extreme-distances", "");
	// sets whether the object can be scaled when you grab it. Check hubs docs or the component to see how it can be scaled in different modes
	newEntity.setAttribute("scalable-when-grabbed", "");
				// another component setup.  Check it out in the components in src
	newEntity.setAttribute("set-xyz-order", "");
	// important! since the matrix auto update on objects in turned off by default
	// in order to save compute power
	newEntity.setAttribute("matrix-auto-update", "");
	// whether this object has a hoverable visuals interaction. You may have to add additional child entities to the template to get this to show up.  Check the component to see how it works 
	newEntity.setAttribute("hoverable-visuals", "");

	// Important!  This Component helps you set the collision shape for the object
	// without it set on the actual entity which contains the mesh (set with the 
	// geometry component above in this case) the physics won't collide and the 
	// object will fall through the ground.  Check the component for details
	bh = document.createAttribute("shape-helper")
	bh.value = "";
	newEntity.setAttributeNode(bh);
				
	//add the listed-media component
	newEntity.setAttribute("listed-media", "");
	
	//add the camera-cube-env component
	newEntity.setAttribute("camera-cube-env", "");
				
	//Once all the attributes are setup on the entity you can append it to the template variable content created above.
	newTemplate.content.appendChild(newEntity);
				
	// once the template is created you append it to the assets
	assets.appendChild(newTemplate);
				
				
	//	This sets up an update function for how often each networked entity needs to update
	// position, rotation, or scale based on each transforms setting in the NAF schema.
	// I'm not sure why it's not a utility function in NAF?
	const vectorRequiresUpdate = epsilon => {
		return () => {
			let prev = null;

			return curr => {
				if (prev === null) {
					prev = new THREE.Vector3(curr.x, curr.y, curr.z);
					return true;
				} else if (!NAF.utils.almostEqualVec3(prev, curr, epsilon)) {
					prev.copy(curr);
					return true;
				}

				return false;
			};
		};
	};

	// Add the new schema to NAF. and declare the networked components and their update 
	// sensitivity using the function above if they modify the transforms.
	NAF.schemas.add({
		template: "#" + id,
		components: [
			{
				component: "position",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			{
				component: "rotation",
				requiresNetworkUpdate: vectorRequiresUpdate(0.5)
			},
			{
				component: "scale",
				requiresNetworkUpdate: vectorRequiresUpdate(0.001)
			},
			"media-loader",
			"material",
			"pinnable"
		]
	});
		
}




// we add the prefix inject_ to our utility functions to isolate them from the global namespace
// registerComponents();
inject_createInteractiveBall();
// inject_createShape();

// we add the prefix mod_ to this function to allow it to be targeted by the chat interface
window.mod_addBall = function() {
	
	if(document.querySelector("a-entity[camera-cube-env]") == null){

		var el = document.createElement("a-entity")
		el.setAttribute("networked", { template: "#interactable-ball-media" } )
		el.object3D.position.y = 2;
		AFRAME.scenes[0].appendChild(el)
		
	} else {
		console.log("a ball already exists");
	}
	
}

window.mod_addShape = function(attributes, id) {
	inject_shapeType(attributes, id);
  
	// if(document.querySelector("a-entity[camera-cube-env]") == null){

  var el = document.createElement("a-entity")
  el.setAttribute("networked", { template: "#" + id } )
  el.object3D.position.y = 2;
  AFRAME.scenes[0].appendChild(el)
		
	//}else{
	//	console.log("a ball already exists");
	//}
	
  return el;
}

window.mod_addBox = function() {
  // primitive: cylinder; radius: 0.25; height: 2;
  // bh = document.createAttribute("material");
	// bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  /*
  var json = {
    "geometry": {
      "primitive": "cylinder",
      "radius": 0.25,
      "height": 2,
    }
  };
  */
  var json = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 2,
    },
    "material": {
      "color": "blue",
      "metalness": 1.0,
      "roughness": .8,
    },
  };
	var id = "interactable-box-media";

  var shape = mod_addShape(json, id);
	return shape;
}

window.mod_addBrick = function(id) {
  // primitive: cylinder; radius: 0.25; height: 2;
  // bh = document.createAttribute("material");
	// bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  /*
  var json = {
    "geometry": {
      "primitive": "cylinder",
      "radius": 0.25,
      "height": 2,
    }
  };
  */
  var json = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 2,
    },
    "material": {
      "color": "red",
      "metalness": 1.0,
      "roughness": .8,
    },
  };
	var id = "interactable-box-media";

  var shape = mod_addShape(json, id);
	return shape;
}

window.mod_addTower = function() {
  var towerHeight = 10;
  var brickHeight = 2;
  
  for (var k = 0; k < towerHeight; k++) {
    var shape = mod_addBrick("brick-" + k);
    shape.object3D.position.y = brickHeight + k * brickHeight;
  }
}

window.mod_addAxis = function() {
  // primitive: cylinder; radius: 0.25; height: 2;
  // bh = document.createAttribute("material");
	// bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  /*
  var json = {
    "geometry": {
      "primitive": "cylinder",
      "radius": 0.25,
      "height": 2,
    }
  };
  */
  var xJson = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 0.5,
      "depth": 1.5,
    },
    "material": {
      "color": "red",
      "metalness": 0.5,
      "roughness": .8,
    },
  };

  var xShape = mod_addShape(xJson, "x-axis");
  xShape.object3D.position.x = 20;


  var zJson = {
    "geometry": {
      "primitive": "box",
      "width": 0.5,
      "height": 0.5,
      "depth": 1.5,
    },
    "material": {
      "color": "green",
      "metalness": 0.5,
      "roughness": .8,
    },
  };

  var zShape = mod_addShape(zJson, "z-axis");
  zShape.object3D.position.z = 20;
}


window.mod_addJengaBrick = function(id) {
  // primitive: cylinder; radius: 0.25; height: 2;
  // bh = document.createAttribute("material");
	// bh.value = "color:tomato;metalness:1.0;roughness:.8;";
  /*
  var json = {
    "geometry": {
      "primitive": "cylinder",
      "radius": 0.25,
      "height": 2,
    }
  };
  */
  var json = {
    "geometry": {
      "primitive": "box",
      "width": 2.5 / 3.0,
      "height": 1.5 / 3.0,
      "depth": 7.5 / 3.0,
    },
    "material": {
      "color": "#DEB887",
      "metalness": 0.0,
      "roughness": 1.0,
      "emissiveIntensity": 0.25
    },
  };
	var id = "interactable-box-media";

  var shape = mod_addShape(json, id);
	return shape;
}



window.mod_addJengaTower = function() {
  var levels = 18;
  var rows = 3;
  var brickWidth = 2.5 / 3.0;
  var brickHeight = 1.5 / 3.0;
  var brickDepth = 7.5 / 3.0;
  var margin = {x: 0.001, y: 0.001};
  var origin = {x: 0, y: 0, z: 0};

  var marginedBrickWidth = brickWidth + margin.x;
  var marginedBrickHeight = brickHeight + margin.y;
  origin.y += marginedBrickHeight;
  
  for (var level = 0; level < levels; level++) {
    for (var row = 0; row < rows; row++) {
      var shape = mod_addJengaBrick("brick-" + row);
      var x = marginedBrickWidth * row;
      var y = level * marginedBrickHeight;
      var z = 0;
      var rotation = 0;
      if (level % 2 == 1) {
        // if this is an odd level
        var temp = x;
        x = z;
        z = temp - marginedBrickWidth;
        // rotate each brick 90 degrees
        rotation = Math.PI / 2.0;
      } else {
        x = x - marginedBrickWidth;
      }
      shape.object3D.position.x = origin.x + x;
      shape.object3D.position.y = origin.y + y;
      shape.object3D.position.z = origin.z + z;
      shape.object3D.rotation.y = rotation;
    }
  }

}