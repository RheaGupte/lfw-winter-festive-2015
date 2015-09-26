( function ( tr ) {

tr.traverseData = function ( data ) {
	var tree = {
		name: 'trends',
		children: []
	};
	var trends = {};

	// Map all trends to an array of their looks
	for ( trendKey in data ) {
		var trendData = data[ trendKey ];

		// Make a new {} is that trend doesn't exist yet
		trends[ trendData.trend ] = trends[ trendData.trend ] || [];

		// Push look
		trends[ trendData.trend ].push( {
			name: trendData.trend,
			size: trendData.score,
			url: trendData.filename,
			designer: trendData.designer
		} );

		if ( trendData.designer.indexOf( '.jpg' ) > -1 ) {
			console.log( trendData.filename );
		}

	}

	// Move trend to the main tree
	for ( trendKey in trends ) {
		var looks = trends[ trendKey ];
		var child = {
			name: trendKey,
			children: []
		}

		for ( var lookIndex in looks ) {
			var look = looks[ lookIndex ];
			child.children.push( look );
		}
		tree.children.push( child );
	}

	return tree;
}

} ( tr ) );
