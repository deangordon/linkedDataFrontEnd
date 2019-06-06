$(document).ready(function(){
	
	var map = L.map('map').setView([54.6,-7.1],8);
	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
	$.urlParam = function(name){
	var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
	if (results==null) {
	   return null;
	}
	return decodeURI(results[1]) || 0;
	}
	
/*	var paramLocation = $.urlParam('location')
	console.log(paramLocation)*/
	
uriGeos = "SELECT DISTINCT  ?type     WHERE {           ?s <http://www.opengis.net/ont/geosparql#hasGeometry> ?bnode ;                            <http://publishmydata.com/def/ontology/foi/displayName> ?name;            <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.   }"
	 $.getJSON("http://linked.nisra.gov.uk/sparql.json?query=" + encodeURIComponent(uriGeos) + " &debug=on&timeout=&format=application%2Fsparql-results%2Bjson&save=display&fname=",
  {},
  function(places) {
     //console.log('places = ', places);
  }).always(function(places){
		var placeTypes = []
		for (i = 0; i <= places.results.bindings.length -1; i++){
//			console.log(places.results.bindings[i].name.value)
			placeTypes.push(places.results.bindings[i].type.value)
		}
	
	$('#nameInput').tokenfield({
		autocomplete: {
		source: placeTypes,
		delay: 1,
		minLength: 0,
	  },
//	  tokens: paramLocation,
	  createTokensOnBlur: false,
	  showAutocompleteOnFocus: false,
	}).on('tokenfield:createtoken', function(e){
		DisplayQueryResults(e.attrs.value)
	})
  })
})
  
  
function DisplayQueryResults(e){
	geo = e
	uriComp = "PREFIX geosparql: <http://www.opengis.net/ont/geosparql#>  SELECT ?name ?type ?code ?parent ?poly  WHERE  {  ?s geosparql:hasGeometry ?bnode;  <http://publishmydata.com/def/ontology/foi/displayName> ?name;  <http://publishmydata.com/def/ontology/foi/code> ?code;  <http://publishmydata.com/def/ontology/foi/active> ?active;  <http://publishmydata.com/def/ontology/foi/parent> ?parentCode;  <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.  ?parentCode <http://publishmydata.com/def/ontology/foi/displayName> ?parent.  ?bnode ?p_blank ?poly .  FILTER(?p_blank = <http://www.opengis.net/ont/geosparql#asWKT> )  FILTER(?type='"+geo+"')}"
	$.getJSON("http://linked.nisra.gov.uk/sparql.json?query=" + encodeURIComponent(uriComp) + " &debug=on&timeout=&format=application%2Fsparql-results%2Bjson&save=display&fname=",
		{},
		function(data) {
			//console.log(data.results.bindings.length)
			//console.log('data = ', data);
			
			var shapeSection = "";
			
			for (i=0; i < data.results.bindings.length; i++){
				areaParent = data.results.bindings[i].parent.value
				areaName = data.results.bindings[i].name.value
				areaType = data.results.bindings[i].type.value
				areaCode = data.results.bindings[i].code.value
				areaPoly = data.results.bindings[i].poly.value
			
				multi = areaPoly.search("MULTIPOLYGON")
				var geoType = "Polygon"
				if (multi == 0){
					geoType = "MultiPolygon"
				}
						
				// split on "), (". Multipolygons will have ")), (("
				splits = areaPoly.split("), (")
				
				polygon = splits[0]
							
				// Remove unwanted formatting from POLYGON coordinates		
				jsonPoly = polygon.replace(/,\s/g,"],[").replace(/\s/g,",").replace("((","[").replace("))","]")
				jsonPoly = jsonPoly.replace("MULTIPOLYGON,","").replace("POLYGON,","")
				
				// Reverse order of points in polygon (must be anti-clockwise: assumes provided clockwise)
				jsonBits = jsonPoly.split("],[")
				jsonBits[0] = jsonBits[0].replace("[","")
				jsonBits[jsonBits.length-1] = jsonBits[jsonBits.length-1].replace("]","")
				
				jsonBits = jsonBits.reverse()
				var jsonCoords = "";
				for (j=0; j < jsonBits.length; j++)
				{
					jsonCoords = jsonCoords + ",[" + jsonBits[j] + "]"
				}
				jsonCoords = jsonCoords.replace(/,/,"")
				
				// Put coordinates in geoJson format
				
				/////////////////// Deal with MultiPolygon //////////////////////////
		
				// now format holes, to be added to the polygon
				holes = ""
				for (j=1;j<splits.length; j++){
					tempSplit = "((" + splits[j]
					jsonPoly = tempSplit.replace(/,\s/g,"],[").replace(/\s/g,",").replace("((","[").replace("))","]")
					
					// Reverse order of points in polygon (must be anti-clockwise: assumes provided clockwise)
					jsonBits = jsonPoly.split("],[")
					jsonBits[0] = jsonBits[0].replace("[","")
					jsonBits[jsonBits.length-1] = jsonBits[jsonBits.length-1].replace("]","")
					
					jsonBits = jsonBits.reverse()
					var holeCoords = "";
					for (k=0; k < jsonBits.length; k++)
					{
						holeCoords = holeCoords + ",[" + jsonBits[k] + "]"
					}
					holeCoords = holeCoords.replace(/,/,"")
					//console.log(jsonCoords)
					holes = holes + ",[" + holeCoords + "]"
				}
				
				////////////				
			// Get centroid of each polygon
			//var bounds = L.polygon(JSON.parse(shapeData).features[0].geometry.coordinates).getBounds()
			jsonCoords_x = jsonCoords.replace(")","").replace("(","")
//			console.log(JSON.parse("[[["+jsonCoords+"]]]"))

			var bounds = L.polygon(JSON.parse("[[["+jsonCoords_x+"]]]")).getBounds()
			var center = bounds.getCenter()
			lat = center.lat
			lng = center.lng
////////////	
				
				if (i == data.results.bindings.length - 1){
					if (geoType == "MultiPolygon")
					{
						shapeSection = shapeSection + "{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" ,\"center\":["+lat+","+lng+"]},\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[[["+jsonCoords+"]"+ holes +"]]}}";
					}
					else{
						shapeSection = shapeSection + "{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" ,\"center\":["+lat+","+lng+"]},\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[["+jsonCoords+"]]}}";
					}
				}
				else{
					if (geoType == "MultiPolygon")
					{
						shapeSection = shapeSection + "{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" ,\"center\":["+lat+","+lng+"]},\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[[["+jsonCoords+"]"+ holes +"]]}},";
					}
					else{
						shapeSection = shapeSection + "{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" ,\"center\":["+lat+","+lng+"]},\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[["+jsonCoords+"]]}},";
					}
				}
	//			console.log(shapeData)
				shapeSection = shapeSection.replace(/\(|\)/g, '')
			}
			
				// Put coordinates in geoJson format
			var prefix = "{\"type\":\"FeatureCollection\",\"features\":["
			var postfix = "]}"
			var shapeData = prefix + shapeSection + postfix
					
			var downloadOption = $('input[name=inlineRadioOptions]:checked').val()
			//console.log(downloadOption)
			if(downloadOption == "geoJson"){
				//console.log(geo)
				download(geo+".json",shapeData)
			}
			
			$("#map").html("")
			d = document.getElementById("map")
			d.outerHTML = "<div style=\"height: 280px\" id=\"map\"></div>"
			
	//		var bounds = L.polygon(JSON.parse(shapeData).features[0].geometry.coordinates).getBounds()
	//console.log(JSON.parse(shapeData).features[0].geometry.coordinates)
	//		var center = bounds.getCenter()
			lat = -6.5
			lng = 54.5
			
			var map = L.map('map').setView([lng,lat],8);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
				
	//		console.log(JSON.parse(shapeData))
				
			L.geoJSON(JSON.parse(shapeData), {
				onEachFeature: function (feature, layer) {
				var idLink = '<a href="' + window.location.origin+ "/rdf/index.html?location=" + feature.properties.name + '-Type">' + feature.id + '</a>'
				layer.bindPopup(feature.properties.name + "</br>" + idLink)
				}
			}).addTo(map)

			
		
				$('#areaType').text(areaType)

				var linkText = '<a href="' + window.location.pathname+ "?location=" + areaParent + '">' + areaParent + '</a>'
				$("#areaParent").html(linkText)
			
				//$('#areaPoly').text(areaPoly)
				$('#areaPoly').text(shapeData)
				//console.log(uriComp)
				uriComp = uriComp.replace(/</g,"&lt;")
				uriComp = uriComp.replace(/>/g,"&gt;")
				uriComp = uriComp.replace(/\s\s/g," <br /> ")
				//console.log(uriComp)
				$('#query').html("<a>"+uriComp+"</a>")

		})
}


function download(filename, text) {
  var element = document.createElement('a');
  var blob = new Blob([text],{type: 'application/json'})
  var objectURL = window.URL.createObjectURL(blob)
  //element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
  //element.setAttribute('href', 'data:application/json;charset=utf-8,' + objectURL);
  element.setAttribute('href', objectURL);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

