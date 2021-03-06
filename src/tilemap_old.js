module.exports = (function (){
    var tiles = [],
        tilesets = [],
        layers = [],
        tileWidth = 0,
        tileHeight = 0,
        mapWidth = 0,
        mapHeight = 0;
        
    var load = function(mapData, options) {
        
      var loading = 0;
      
      // Release old tiles & tilesets
      tiles = [];
      tilesets = [];
      
      // Resize the map
      tileWidth = mapData.tilewidth;
      tileHeight = mapData.tileheight;
      mapWidth = mapData.width;
      mapHeight = mapData.height;
      
      // Load the tileset(s)
      mapData.tilesets.forEach( function(tilesetmapData, index) {
        // Load the tileset image
        var tileset = new Image();
        loading++;
        tileset.onload = function() {
          loading--;
          if(loading == 0 && options.onload) options.onload();
        }
        tileset.src = tilesetmapData.image;
        tilesets.push(tileset);
        
        // Create the tileset's tiles
        var colCount = 20,//Math.floor(tilesetmapData.imagewidth / tileWidth),
            rowCount = 71,//Math.floor(tilesetmapData.imageheight / tileHeight),
            tileCount = colCount * rowCount;
        
        for(i = 0; i < tileCount; i++) {
          var props = tilesetmapData.tiles.filter(element => element.id ==i)
          var tile = {
            // Reference to the image, shared amongst all tiles in the tileset
            image: tileset,
            // Source x position.  i % colCount == col number (as we remove full rows)
            sx: (i % colCount) * tileWidth,
            // Source y position. i / colWidth (integer division) == row number 
            sy: Math.floor(i / rowCount) * tileHeight,
            // Indicates a solid tile (i.e. solid property is true).  As properties
            // can be left blank, we need to make sure the property exists. 
            // We'll assume any tiles missing the solid property are *not* solid
            
            solid: (props && props.properties && props.properties.solid == "true") ? true : false
          }
          tiles.push(tile);
        }
      });
      
      // Parse the layers in the map
      mapData.layers.forEach( function(layerData) {
        
        // Tile layers need to be stored in the engine for later
        // rendering
        if(layerData.type == "tilelayer") {
          // Create a layer object to represent this tile layer
          var layer = {
            name: layerData.name,
            width: layerData.width,
            height: layerData.height,
            visible: layerData.visible
          }
        
          // Set up the layer's data array.  We'll try to optimize
          // by keeping the index data type as small as possible
          if(tiles.length < Math.pow(2,8))
            layer.data = new Uint8Array(layerData.data);
          else if (tiles.length < Math.pow(2, 16))
            layer.data = new Uint16Array(layerData.data);
          else 
            layer.data = new Uint32Array(layerData.data);
        
          // save the tile layer
          layers.push(layer);
        }
      });
    }
  
    var render = function(screenCtx,offsetx,offsety,zoom) {
      // Render tilemap layers - note this assumes
      // layers are sorted back-to-front so foreground
      // layers obscure background ones.
      // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
      layers.forEach(function(layer){
        
        // Only draw layers that are currently visible
        if(layer.visible) { 
          for(y = offsety; y < Math.min(offsety+4,layer.height); y++) {
            for(x = offsetx; x < Math.min(offsetx+6,layer.width); x++) {
              var tileId = layer.data[x + layer.width * y];
              
              // tiles with an id of 0 don't exist
              if(tileId != 0) {
                var tile = tiles[tileId - 1];
                if(tile.image) { // Make sure the image has loaded
                  screenCtx.drawImage(
                    tile.image,     // The image to draw 
                    tile.sx, tile.sy, tileWidth, tileHeight, // The portion of image to draw
                    (x - offsetx)*tileWidth, (y-offsety)*tileHeight, tileWidth*zoom, tileHeight*zoom // Where to draw the image on-screen
                  );
                }
              }
              
            }
          }
        }
        
      });
    }
    
    var tileAt = function(x, y, layer) {
      // sanity check
      if(layer < 0 || x < 0 || y < 0 || layer >= layers.length || x > mapWidth || y > mapHeight) 
        return undefined;  
      return tiles[layers[layer].data[x + y*mapWidth] - 1];
    }
    
    // Expose the module's public API
    return {
      load: load,
      render: render,
      tileAt: tileAt
    }
    
    
  })();