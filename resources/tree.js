( function ( d3, tr, document, $ ) {

tr.draw = function ( data ) {

	var w = $( '#chart' ).width(),
		h = $( '#chart' ).height(),
		x = d3.scale.linear().range([0, w]),
		y = d3.scale.linear().range([0, h]),
		color = d3.scale.ordinal().range( [
			'#BEE6CE', // Green
			'#1E1221', // Black
			'#DBC7EF', // Purple
			'#A0A98B', // Olive
			'#FCE2DA' //Pink
		] ).domain( [
			'all black',
			'geometric',
			'oversized',
			'oriental',
			'high neck',
			'off shoulder',
			'psychedelic',
			'high low hem',
			'minimalism',
			'neon',
			'pleats',
			'off shoulder',
		] ),
		root,
		node;

	var treemap = d3.layout.treemap()
		.round(false)
		.size([w, h])
		.sticky(true)
		.mode( 'squarify' )
		.ratio( 0.8 )
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
		.style("fill", function(d) { return color(d.parent.name); })
		.style("stroke", function(d) { return color(d.parent.name); });


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
		.style( 'fill', function ( d ) {
			if ( color( d.name ) !== '#1E1221' ) {
				return '#000';
			} else {
				return '#fff';
			}
		} )
		.style( 'font-size', function ( d ) {
			d.w = this.getComputedTextLength() + 10;
			if ( d.w  > d.dx ) {
				return '8px';
			}
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

		// Prefetch images
		for( var lookIndex in d.children ) {
			var look = d.children[ lookIndex ];

			// Check if we are on the designer grid
			if ( look.url === undefined ) {
				break;
			}

			var im = new Image();
			im.src = 'resources/images/' + look.url;
		}

		var t = svg.selectAll( 'g.cell' )
			.transition()
			.duration( 750 )//d3.event.altKey ? 7500 : 750 )
			.attr( 'transform' , function( d ) {
				return 'translate(' + x( d.x ) + ',' + y( d.y ) + ')';
		} );

		// Show designer name if zoomed in
		// Reduce color filter if zoomed in
		if ( d.name === 'trends' ) {
			t.select( 'text' ).style( 'opacity', 0 );
		} else {
			t.select( 'text' ).style( 'opacity', 1 );
		}

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

		// Get adjacent images
		var allLooks = d.parent.children;
		var nextIndex = allLooks.indexOf( d ) + 1;
		var prevIndex = allLooks.indexOf( d ) - 1;
		if ( nextIndex === allLooks.length ) {
			nextIndex = 0;
		}
		if ( prevIndex < 0 ) {
			prevIndex = allLooks.length - 1;
		}

		var nextImage = allLooks[ nextIndex ]
		var prevImage = allLooks[ prevIndex ]

		$( 'body' ).append(
			$( '<div>' )
				.addClass( 'image-container' )
				.css( 'background-image', 'url("resources/images/' + d.url + '")' )
				.fadeIn()
				.append(
					$( '<a>' ).addClass( 'prev' ).html( '&#9664;' ).on( 'click', function () {
						showFull( prevImage );
					} ),
					$( '<a>' ).addClass( 'next' ).html( '&#9654;' ).on( 'click', function () {
						showFull( nextImage );
					} )
				)
		);

		$( '#actionbar span' ).fadeOut();
		var $h1 = $( '#actionbar h1' );
		$h1.data( 'old-text', $h1.text() )
		updateTitle( d.name + ' : ' + d.designer, root );
	}

	function updateTitle( title, zoomData ) {
		$( '#actionbar h1' ).html( title );
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
