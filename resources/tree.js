( function ( d3, tr, document, $ ) {

tr.draw = function ( data ) {

	var w = $( '#chart' ).width(),
		h = $( '#chart' ).height(),
		x = d3.scale.linear().range([0, w]),
		y = d3.scale.linear().range([0, h]),
		color = d3.scale.ordinal().range( [
			'#393b79',
			'#5254a3',
			'#6b6ecf',
			'#9c9ede',
			'#637939',
			'#8ca252',
			'#b5cf6b',
			'#cedb9c',
			'#8c6d31',
			'#bd9e39',
			'#e7ba52',
			'#e7cb94',
			'#843c39',
			'#ad494a',
			'#d6616b',
			'#e7969c',
			'#7b4173',
			'#a55194',
			'#ce6dbd',
			'#de9ed6',
			'#3182bd',
			'#6baed6',
			'#9ecae1',
			'#c6dbef',
			'#e6550d',
			'#fd8d3c',
			'#fdae6b',
			'#fdd0a2',
			'#756bb1',
			'#9e9ac8',
			'#bcbddc',
			'#dadaeb',
			'#636363',
			'#969696',
			'#bdbdbd',
			'#d9d9d9'
		] ).domain( [
			'oriental',
			'statement beauty',
			'artsy',
			'checks',
			'cutout',
			'statement accessories',
			'wide pants',
			'sheer',
			'oversized',
			'seventies',
			'fringes',
			'crop top',
			'pleats',
			'wide pants',
			'layering',
			'fall florals',
			'neon',
			'drapes',
			'high low hem',
			'capes',
			'typography'
		] ),
		root,
		node;

	var treemap = d3.layout.treemap()
		.round(false)
		.size([w, h])
		.sticky(true)
		.mode( 'squarify' )
		.ratio( 2.0 )
		.value(function(d) { return d.size; });

	var svg = d3.select("#chart").append("div")
		.attr("class", "chart")
		.style("width", w + "px")
		.style("height", h + "px")
		.append("svg:svg")
			.attr("width", w)
			.attr("height", h)
			.append("svg:g")
				.attr("transform", "translate(.5,.5)");


	node = root = data;

	var nodes = treemap.nodes( root ).filter( function( d ) {
		return !d.children;
	} );

	var parents = treemap.nodes( root ).filter( function( d ) {
		return d.children;
	} );



	var cell = svg.selectAll("g")
		.data(nodes)
		.enter().append("svg:g")
		.attr("class", "cell")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		.on( 'click', function( d ) {
			d3.event.stopPropagation();
			return zoom( node == d.parent ? root : d.parent );
		});

	var images = cell.append("svg:image")
		.attr("width", function(d) { return d.dx; })
		.attr("height", function(d) { return d.dy; })
		.attr("preserveAspectRatio", "xMidYMid slice" )
		.attr("xlink:href", function(d) {
			return "resources/images_small/" + d.url;
		} );

	cell.append("svg:rect")
		.attr("width", function(d) { return d.dx; })
		.attr("height", function(d) { return d.dy; })
		.on( 'mouseover', function ( d ) {
			// TODO
			if ( this.getAttribute( "width" ) < 100 ) {
				return false;
			}
			var image = images.filter( function ( image ) {
				return image.url === d.url
			} );
			image.attr("xlink:href", function(d) {
				return "resources/images/" + d.url;
			} );
		} )
		.on( 'mouseout', function ( d ) {
			var image = images.filter( function ( image ) {
				return image.url === d.url
			} );
			image.attr("xlink:href", function(d) {
				return "resources/images_small/" + d.url;
			} );
		} )
		.on( 'click', function ( d ) {
			d3.event.stopPropagation();

			var image = images.filter( function ( image ) {
				return image.url === d.url
			} );

			// Zoom in further if we are already showing a large image
			if ( image.attr( 'xlink:href' ).indexOf( 'small' ) < 0 ) {
				showFull( d );
			} else {
				return zoom( node == d.parent ? root : d.parent );

			}
		} )
		.style("fill", function(d) { return color(d.parent.name); });


	cell.append("svg:text")
		.attr("x", function(d) { return d.dx / 2; })
		.attr("y", function(d) { return d.dy / 2; })
		.attr("dy", ".35em")
		.attr("text-anchor", "middle")
		.attr( 'class', 'child-text' )
		.text(function(d) { return d.designer; })
		.style( 'opacity', 0 );

	var parentCell = svg.selectAll( 'g.parent' )
		.data( parents )
		.enter().append( 'svg:g' )
		.attr( 'class', 'parent' )
		.attr( 'transform', function( d ) {
			return 'translate(' + d.x + ',' + d.y + ')';
		} );

	parentCell.append("svg:text")
		.attr( 'x', function( d ) {
			return d.dx / 2;
		} )
		.attr( 'y', function( d ) {
			return d.dy / 2;
		} )
		.attr( 'class', 'parent-text' )
		.attr( 'dy', '.35em' ) // TODO: Magic number
		.attr( 'text-anchor', 'middle' )
		.text( function( d ) {
			if ( d.name === 'trends' ) {
				return;
			}
			return d.name;
		} )
		.style( 'opacity', 1 );


//	svg.on( 'click', function() {
//		d3.event.stopPropagation();
//		zoom( root );
//	} );

	function size(d) {
		return d.size;
	}

	function count(d) {
		return 1;
	}

	function zoom(d) {
		var kx = w / d.dx, ky = h / d.dy;
			x.domain([d.x, d.x + d.dx]);
			y.domain([d.y, d.y + d.dy]);

		var t = svg.selectAll( 'g.cell' )
			.transition()
			.duration( 750 )//d3.event.altKey ? 7500 : 750 )
			.attr( 'transform' , function( d ) {
				return 'translate(' + x( d.x ) + ',' + y( d.y ) + ')';
		} );

		t.select("image")
			.attr("width", function(d) { return kx * d.dx; })
			.attr("height", function(d) { return ky * d.dy; });


		t.select("rect")
			.attr("width", function(d) { return kx * d.dx; })
			.attr("height", function(d) { return ky * d.dy; });

		t.select( 'text' )
			.attr( 'x', function( d ) {
				return kx * d.dx / 2;
			} )
			.attr( 'y', function( d ) {
				return ky * d.dy / 2;
			} )

		// Show designer name if zoomed in
		// Reduce color filter if zoomed in
		if ( d.name === 'trends' ) {
			svg.selectAll( 'rect' ).attr( 'class', 'more-filter' );
			t.select( 'text' ).style( 'opacity', 0 );
		} else {
			svg.selectAll( 'rect' ).attr( 'class', 'less-filter' );
			t.select( 'text' ).style( 'opacity', 1 );
		}


		// Parent cells
		var t = svg.selectAll( 'g.parent' )
			.transition()
			.duration( 750 )//d3.event.altKey ? 7500 : 750 )
			.attr( 'transform' , function( d ) {
				return 'translate(' + x( d.x )  + ',' + y( d.y ) + ')';
			} );

		// Move trend name to top if zoomed in
		if ( d.name === 'trends' ) {
			t.select( 'text' ).style( 'opacity', 1 );
			updateTitle( 'Trend Report');
		} else {
			t.select( 'text' ).style( 'opacity', 0 );
			updateTitle( d.name, root );
		}



		node = d;
	}

	function showFull( d ) {
		$( 'body' ).append(
			$( '<div>' )
				.addClass( 'image-container' )
				.css( 'background-image', 'url("resources/images/' + d.url + '")' )
				.fadeIn()
		);

		$( '#actionbar span' ).fadeOut();
		var $h1 = $( '#actionbar h1' );
		$h1.data( 'old-text', $h1.text() )
		updateTitle( d.designer, root );
	}

	function updateTitle( title, zoomData ) {
		$( '#actionbar h1' ).text( title );
		if ( zoomData !== undefined ) {
			$( '#actionbar a' )
				.fadeIn()
				.off( 'click' )
				.on( 'click', function ( e ) {
					if ( $( '.image-container' ).length > 0 ) {
						$( '#actionbar h1' ).text( $( '#actionbar h1' ).data( 'old-text' ) );
						$( '#actionbar span' ).fadeIn();
						$( '.image-container' ).fadeOut( function () {
							$( this ).remove();
						} );
					} else {
						zoom( zoomData );
						e.stopPropagation();
					}
				} );
		} else {
			$( '#actionbar a' ).fadeOut();
		}
	}
};



} ( d3, tr, document, jQuery ) );
