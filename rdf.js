// Broken by Ahoghil_2, which has 2 polygons specified under polygon: see SPARQL

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
	
	var paramLocation = $.urlParam('location')
	console.log(paramLocation)
	
uriGeos = "SELECT DISTINCT ?name  ?type     WHERE {           ?s <http://www.opengis.net/ont/geosparql#hasGeometry> ?bnode ;                            <http://publishmydata.com/def/ontology/foi/displayName> ?name;            <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.   }"
	 $.getJSON("http://linked.nisra.gov.uk/sparql.json?query=" + encodeURIComponent(uriGeos) + " &debug=on&timeout=&format=application%2Fsparql-results%2Bjson&save=display&fname=",
  {},
  function(places) {
     //console.log('places = ', places);
  }).always(function(places){
	  	var placeNames = []
		var placeTypes = []
		for (i = 0; i <= places.results.bindings.length -1; i++){
//			console.log(places.results.bindings[i].name.value)
			placeNames.push(places.results.bindings[i].name.value+"- "+places.results.bindings[i].type.value)
		}
	//console.log(placeNames)
	$('#nameInput').tokenfield({
		autocomplete: {
		source: placeNames,
		delay: 1,
		minLength: 4,
	  },
	  tokens: paramLocation,
	  createTokensOnBlur: false,
	  showAutocompleteOnFocus: false,
	}).on('tokenfield:createtoken', function(e){
		console.log(e.attrs.value)
		DisplayQueryResults(e.attrs.value)
	})
  })
  
  if(paramLocation != null){
	  DisplayQueryResults(paramLocation)
  }
  
})
  
function DisplayQueryResults(e){
			geo = e.split('-')[0]
		geoLevel = e.split('-')[1]
		switch(geoLevel)
		{
			case " Local Government Districts":
			uriComp = "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>  PREFIX gender: <http://linked.nisra.gov.uk/def/concept/gender/>  PREFIX measure: <http://linked.nisra.gov.uk/def/measure/>  PREFIX geo: <http://statistics.data.gov.uk/def/statistical-geography#>  PREFIX ndim: <http://linked.nisra.gov.uk/def/dimension/>  PREFIX sdim: <http://purl.org/linked-data/sdmx/2009/dimension#>  PREFIX geosparql:  <http://www.opengis.net/ont/geosparql#>	    SELECT ?name   ?poly ?parent ?type ?active ?code (SUM(?people) as ?allPeople) ?gender ?year ?landHectarage ?inLandWaterHectarage  WHERE {  ?s geosparql:hasGeometry ?bnode ;     <http://publishmydata.com/def/ontology/foi/displayName> ?name;     <http://publishmydata.com/def/ontology/foi/code> ?code;	 <http://publishmydata.com/def/ontology/foi/active> ?active;     <http://publishmydata.com/def/ontology/foi/parent> ?parentCode;     <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.  ?parentCode <http://publishmydata.com/def/ontology/foi/displayName> ?parent.  ?bnode ?p_blank ?poly .  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasLandHectarage> ?landHectarage}.  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasInlandWaterHectarage> ?inLandWaterHectarage}.  ?ss measure:count ?people;  sdim:refArea ?codeRef2;  sdim:refPeriod ?yearCode;  ndim:gender ?genderCode;  sdim:refArea ?areaCode;  ndim:age ?ageCode.  ?ageCode rdfs:label ?age .  ?genderCode rdfs:label ?gender .  ?yearCode rdfs:label ?year .  ?areaCode geo:officialname ?area.  ?codeRef2 <http://publishmydata.com/def/ontology/foi/code> ?code2.  FILTER(?p_blank = <http://www.opengis.net/ont/geosparql#asWKT>)  FILTER(?name='"+geo+"')  FILTER(?code = ?code2 )  }  GROUP BY ?name   ?poly ?parent ?type ?active ?code ?gender ?year ?landHectarage ?inLandWaterHectarage  ORDER BY DESC(?year)  limit 3"
			break;
			default:
			uriComp = "PREFIX geosparql: <http://www.opengis.net/ont/geosparql#>  SELECT ?name ?type ?code ?parent ?poly ?landHectarage ?inLandWaterHectarage  WHERE  {  ?s geosparql:hasGeometry ?bnode;  <http://publishmydata.com/def/ontology/foi/displayName> ?name;  <http://publishmydata.com/def/ontology/foi/code> ?code;  <http://publishmydata.com/def/ontology/foi/active> ?active;  <http://publishmydata.com/def/ontology/foi/parent> ?parentCode;  <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.  ?parentCode <http://publishmydata.com/def/ontology/foi/displayName> ?parent.  ?bnode ?p_blank ?poly .  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasLandHectarage> ?landHectarage}.  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasInlandWaterHectarage> ?inLandWaterHectarage}.  FILTER(?p_blank = <http://www.opengis.net/ont/geosparql#asWKT> )  FILTER(?name='"+geo+"')}"
			break;
		}
		$.getJSON("http://linked.nisra.gov.uk/sparql.json?query=" + encodeURIComponent(uriComp) + " &debug=on&timeout=&format=application%2Fsparql-results%2Bjson&save=display&fname=",
			{},
			function(data) {
			//console.log('data = ', data);
			areaParent = data.results.bindings[0].parent.value
			areaName = data.results.bindings[0].name.value
			areaType = data.results.bindings[0].type.value
			areaCode = data.results.bindings[0].code.value
			areaPoly = data.results.bindings[0].poly.value
			
			multi = areaPoly.search("MULTIPOLYGON")
			console.log(multi)
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
			for (i=0; i < jsonBits.length; i++)
			{
				jsonCoords = jsonCoords + ",[" + jsonBits[i] + "]"
			}
			jsonCoords = jsonCoords.replace(/,/,"")
			
			// Put coordinates in geoJson format
			
			/////////////////// Deal with MultiPolygon //////////////////////////
	
			// now format holes, to be added to the polygon
			holes = ""
			for (i=1;i<splits.length; i++){
				tempSplit = "((" + splits[i]
				jsonPoly = tempSplit.replace(/,\s/g,"],[").replace(/\s/g,",").replace("((","[").replace("))","]").replace(/\(|\)/g, '')
				
				// Reverse order of points in polygon (must be anti-clockwise: assumes provided clockwise)
				jsonBits = jsonPoly.split("],[")
				jsonBits[0] = jsonBits[0].replace("[","")
				jsonBits[jsonBits.length-1] = jsonBits[jsonBits.length-1].replace("]","")
				
				jsonBits = jsonBits.reverse()
				var holeCoords = "";
				for (i=0; i < jsonBits.length; i++)
				{
					holeCoords = holeCoords + ",[" + jsonBits[i] + "]"
				}
				holeCoords = holeCoords.replace(/,/,"")
				//console.log(jsonCoords)
				holes = holes + ",[" + holeCoords + "]"
			}
			console.log(geoType)
			var shapeData = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" },\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[["+jsonCoords+"]]}}]}";
			if (geoType == "MultiPolygon")
			{
				shapeData = "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"id\":\""+areaCode+"\",\"properties\":{\"name\":\""+areaName+"\" },\"geometry\":{\"type\":\""+ geoType +"\",\"coordinates\":[[["+jsonCoords+"]"+ holes +"]]}}]}";
			}
//			console.log(shapeData)
			shapeData = shapeData.replace(/\(|\)/g, '')
			
//			console.log(JSON.parse(shapeData))
			$("#map").html("")
			d = document.getElementById("map")
			d.outerHTML = "<div style=\"height: 280px\" id=\"map\"></div>"
			
			var bounds = L.polygon(JSON.parse(shapeData).features[0].geometry.coordinates).getBounds()
			var center = bounds.getCenter()
			//console.log(center)
			lat = center.lat
			lng = center.lng
			
			var map = L.map('map').setView([lng,lat],8);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);
			
			L.geoJson(JSON.parse(shapeData)).addTo(map)
			b = L.geoJson(JSON.parse(shapeData))
			map.fitBounds(b.getBounds())
	
			try{
				areaLand = data.results.bindings[0].landHectarage.value
				areaWater = data.results.bindings[0].inLandWaterHectarage.value
				$('#areaLand').text(areaLand)
				$('#areaWater').text(areaWater)
				$('#landHectares').text("Area of Land (Hectares)")
				$('#inlandWaterHectares').text("Inland Water (Hectares)")
			}
			catch(error){
				$('#areaLand').text("")
				$('#areaWater').text("")
				$('#landHectares').text("")
				$('#inlandWaterHectares').text("")
			}
			
			$('#areaName').text(areaName)
			$('#areaType').text(areaType)
			$('#areaCode').text(areaCode)

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
			
			try {
				pop0 = data.results.bindings[0].allPeople.value
				gender0 = data.results.bindings[0].gender.value
				pop1 = data.results.bindings[1].allPeople.value
				gender1 = data.results.bindings[1].gender.value
				pop2 = data.results.bindings[2].allPeople.value
				gender2 = data.results.bindings[2].gender.value
				
				$('#areaPop0').text(pop0)
				$("#Gender0").text(gender0)
				$('#areaPop1').text(pop1)
				$("#Gender1").text(gender1)
				$('#areaPop2').text(pop2)
				$("#Gender2").text(gender2)
			}
			catch(error){
				$('#areaPop0').text("")
				$("#Gender0").text("")
				$('#areaPop1').text("")
				$("#Gender1").text("")
				$('#areaPop2').text("")
				$("#Gender2").text("")
			}

			
		}).always(function(data){
			areaName = data.results.bindings[0].name.value
			uriComp2 = "PREFIX geosparql:  <http://www.opengis.net/ont/geosparql#>	SELECT ?name WHERE {  ?s geosparql:hasGeometry ?bnode ;     <http://publishmydata.com/def/ontology/foi/displayName> ?name;     <http://publishmydata.com/def/ontology/foi/code> ?code;	 <http://publishmydata.com/def/ontology/foi/active> ?active;     <http://publishmydata.com/def/ontology/foi/parent> ?parentCode;     <http://publishmydata.com/def/ontology/foi/memberOf> ?typeCode.  ?typeCode <http://www.w3.org/2000/01/rdf-schema#label> ?type.  ?parentCode <http://publishmydata.com/def/ontology/foi/displayName> ?parent.  ?bnode ?p_blank ?poly .  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasLandHectarage> ?landHectarage}.  OPTIONAL{?s <http://statistics.data.gov.uk/def/measurement#hasInlandWaterHectarage> ?inLandWaterHectarage}.  FILTER(?p_blank = <http://www.opengis.net/ont/geosparql#asWKT>)  FILTER(?parent='"+areaName+"')} ORDER BY ?name"
			$.getJSON("http://linked.nisra.gov.uk/sparql.json?query=" + encodeURIComponent(uriComp2) + " &debug=on&timeout=&format=application%2Fsparql-results%2Bjson&save=display&fname=",
			{},
			function(kids) {
				$('#areaChildren').text("None")
				var areaChildren = ""
				for (i = 0; i <= kids.results.bindings.length -1; i++){
					var childLink = '<a href="' + window.location.pathname+ "?location=" + kids.results.bindings[i].name.value + '">' + kids.results.bindings[i].name.value + ' ;</a>'
				areaChildren = areaChildren + childLink + " "
				
				}
				$('#areaChildren').html(areaChildren)
			});		
		})
}