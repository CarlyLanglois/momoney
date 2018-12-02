/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.7 - Loading external data
*/

function filterOutInvalidRows(rows)
{
    var filtered_rows = rows.filter(function(row){
        if (isNaN(row["BUDGET YEAR"])){ return false; }
        if (isNaN(row["TOTAL REVENUE"])){ return false; }
        if (isNaN(row["TOTAL EXPENDITURES"])){ return false; }
        return true;
    });
    return filtered_rows;
}

function averageRevenue(rows){
    var totalRevenueSum = 0;
    rows.forEach(function(row){
      totalRevenueSum += row["TOTAL REVENUE"];
    });
    var totalRevenueAverage = totalRevenueSum / rows.length;
    return totalRevenueAverage;
}

d3.csv("../data/budget.csv").then(function(rows){
    rows.forEach(function(row){
        // Convert strings to integers
        row["POPULATION"] = parseInt(row["POPULATION"]);
        row["TOTAL REVENUE"] = parseInt(row["TOTAL REVENUE"]);
        row["TOTAL EXPENDITURES"] = parseInt(row["TOTAL EXPENDITURES"]);
        row["POLICE"] = parseInt(row["POLICE"]);
        row["BUDGET YEAR"] = parseInt(row["BUDGET YEAR"]);
    });

    var filtered_rows = filterOutInvalidRows(rows);

    var totalRevenueAverage = averageRevenue(filtered_rows);

    var svg = d3.select("#chart-area").append("svg")
        .attr("width", 1400)
        .attr("height", 1400);

    var circles = svg.selectAll("circle")
        .data(filtered_rows);

    circles.enter()
        .append("circle")
            .attr("cx", function(d, i){
                console.log(d);
                return ((i * 50) + 25);
            })
            .attr("cy", function(d, i){
                return ((i * 50) + 25);
            })
            .attr("r", function(d){
                return d["TOTAL REVENUE"]/totalRevenueAverage * 25;
            })
            .attr("stroke","black")
	          .attr("fill", "white")

    var text = svg.selectAll('text')
        .data(filtered_rows)
        .enter()
        .append('text')
          .attr("x", function(d, i){
              return (i * 50) + 25;
          })
          .attr("y", function(d, i){
              return ((i * 50) + 25);
          })
          .text( function (d) {
                     return d.MUNICIPALITY;
                   })
                   .attr("font-family", "sans-serif")
                   .attr("font-size", "10px")
                   .attr("fill", "red")
                   .attr("text-anchor", "middle")

}).catch(function(error){
    console.log(error);
})

// ol
var vectorSource = new ol.source.Vector({
        url: '../data/Municipal_Boundaries.geojson',
        format: new ol.format.GeoJSON()
      });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          }),
          vectorLayer,
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-90.2, 38.6]),
          zoom: 10
        })
      });
      console.log(map.getView().getProjection())


      var features;
      var centers = {type: 'FeatureCollection', features: []};
      var pointSource = {};
      var pointLayer = {};

      pointSource = new ol.source.Vector({});

      fetch('../data/Municipal_Boundaries.geojson')
        .then(function(r) {
          return r.json()
        })
        .then(function(json) {
          features = json;
          console.log(features)

          features.features.forEach(function(f) {
            var center = turf.centerOfMass(f);
            console.log(center)
            console.log(center.geometry)
            var feature = new ol.Feature({
              geometry: new ol.geom.Point(center.geometry.coordinates),
            })
            // var feature = new ol.Feature({
            //   center
            // })
            // console.log(feature)
            feature.getGeometry().transform('EPSG:4326', 'EPSG:3857')
            console.log(feature.getGeometry())
            pointSource.addFeature(feature);
            //console.log(center.getGeometry())
            //centers.features.push(turf.centerOfMass(f))
          })

          // console.log(centers)
          // pointSource = new ol.source.Vector({});

          // pointSource.addFeatures(centers);
          pointLayer = new ol.layer.Vector({
            source: pointSource
          });
          map.addLayer(pointLayer);
          console.log(pointSource.getFeatures())


        })
