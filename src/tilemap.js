export default class tilemap {
    constructor(mapData, options) {
      var loading = 0;
      
      // Release old tiles & tilesets
      this.tiles = [];
      this.tilesets = [];
      this.layers = [];
      
      // Resize the map
      this.tileWidth = mapData.tilewidth;
      this.tileHeight = mapData.tileheight;
      this.mapWidth = mapData.width;
      this.mapHeight = mapData.height;
      if (options.fastmap) {
        this.mapimage = new Image();
        loading++
        this.mapimage.onload =function() {
          loading--;
          if(loading == 0 && options.onload) options.onload();
        }
        this.mapimage.src = options.fastmap;
      }
      mapData.tilesets.forEach( function(tilesetmapData, index) {
        var tileset = new Image();
        loading++;
        tileset.onload = function() {
          loading--;
          if(loading == 0 && options.onload) options.onload();
        }
        tileset.src = tilesetmapData.image;
        this.tilesets.push(tileset);
        
        // Create the tileset's tiles
        var colCount = tilesetmapData.columns,
            rowCount = Math.floor(tilesetmapData.imageheight / this.tileHeight),
            tileCount = colCount * rowCount;
        
        for(var i = 0; i < tileCount; i++) {
          var props = tilesetmapData.tiles.filter(element => element.id ==i)
          var tile = {
            // Reference to the image, shared amongst all tiles in the tileset
            image: tileset,
            // Source x position.  i % colCount == col number (as we remove full rows)
            sx: (i % colCount) * this.tileWidth,
            // Source y position. i / colWidth (integer division) == row number 
            sy: Math.floor(i / rowCount) * this.tileHeight,
            // Indicates a solid tile (i.e. solid property is true).  As properties
            // can be left blank, we need to make sure the property exists. 
            // We'll assume any tiles missing the solid property are *not* solid
            
            solid: (props[0] && props[0].properties && props[0].properties.filter(propt => propt.name == "solid")[0] && props[0].properties.filter(propt => propt.name == "solid")[0].value) ? true : false,
            slow: (props[0] && props[0].properties && props[0].properties.filter(propt => propt.name == "slow")[0]) ? props[0].properties.filter(propt => propt.name == "slow")[0].value : 1
          }
          this.tiles.push(tile);
        }
        },this);

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
              if(this.tiles.length < Math.pow(2,8))
                layer.data = new Uint8Array(layerData.data);
              else if (this.tiles.length < Math.pow(2, 16))
                layer.data = new Uint16Array(layerData.data);
              else 
                layer.data = new Uint32Array(layerData.data);
            
              // save the tile layer
              this.layers.push(layer);
            }
          },this);
    }

    render(screenCtx,offsetx,offsety,zoom) {
        // Render tilemap layers - note this assumes
        // layers are sorted back-to-front so foreground
        // layers obscure background ones.
        // see http://en.wikipedia.org/wiki/Painter%27s_algorithm
        if (this.mapimage) {
          screenCtx.drawImage(this.mapimage,offsetx*this.tileWidth,offsety*this.tileHeight,1024,768,0,0,1024,768);
        } else {
        this.layers.forEach(function(layer){
          
          // Only draw layers that are currently visible
          if(layer.visible) { 
            for(var y = Math.max(Math.floor(offsety),0); y < Math.min(offsety+21,layer.height); y++) {
              for(var x = Math.max(Math.floor(offsetx),0); x < Math.min(offsetx+30,layer.width); x++) {
                var tileId = layer.data[x + layer.width * y];
                
                // tiles with an id of 0 don't exist
                if(tileId != 0) {
                  var tile = this.tiles[tileId - 1];
                  if(tile.image) { // Make sure the image has loaded
                    screenCtx.drawImage(
                      tile.image,     // The image to draw 
                      tile.sx, tile.sy, this.tileWidth, this.tileHeight, // The portion of image to draw
                      (x-offsetx)*this.tileWidth, (y-offsety)*this.tileHeight, this.tileWidth*zoom, this.tileHeight*zoom // Where to draw the image on-screen
                    );
                  }
                }
                
              }
            }
          }
          
        },this);}
      }
      
      tileAt(x, y, layer) {
        // sanity check
        if(layer < 0 || x < 0 || y < 0 || layer >= this.layers.length || x > this.mapWidth || y > this.mapHeight) 
          return undefined;  
        return this.tiles[this.layers[layer].data[x + y*this.mapWidth] - 1];
      }
}