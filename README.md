# linkedDataFrontEnd
This is a proof of concept showing HTML and JS application displaying data in rdf from linked.nisra.gov.uk

It consists of 2 HTML pages, each of which accesses data from [http://linked.nisra.gov.uk](http://linked.nisra.gov.uk)

* __index.html__ allows you to search areas in Northern Ireland, in any of the government geographies: it will zoom to the selected geography and display the data available for that geogrphy, including the polygon data.

* __shapes.html__ allows you to see all of the areas in each of the geographies. You can download the _.geojson_ file describing these geographies by selecting the radio button then entering the geography name in the select box. Shape files and other formats could also be supported, but have not been implemented yet.

In both cases, the SPARQL query used to get the data from [http://linked.nisra.gov.uk](http://linked.nisra.gov.uk) is included, along with a link to the interactive SPARQL query builder. 

It is built with JQuery, Bootstrap and uses leaflet maps.
 
