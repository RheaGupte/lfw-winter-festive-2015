var tr = tr || {};

( function ( d3, tr ) {
window.onload = function () {

d3.csv( 'resources/beauty.csv', function( data ) {
	var json = tr.traverseData( data );
	tr.draw( json );
} );


};
} ( d3, tr ) );
