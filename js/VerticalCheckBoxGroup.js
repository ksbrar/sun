// Copyright 2013-2018, University of Colorado Boulder

/**
 * A vertical group of check boxes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  var CheckBox = require( 'SUN/CheckBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * Main constructor.
   *
   * @param items  an array of {content, property, indent, [tandem]}
   * @param {Object} [options]
   * @constructor
   */
  function VerticalCheckBoxGroup( items, options ) {

    options = _.extend( {
      spacing: 10, // vertical spacing
      padding: 8, //TODO what is this? It looks like it's added to the right of the check box. Shouldn't this be an x-margin, added to left and right?
      checkBoxColor: 'black',
      align: 'left',
      boxWidth: 21,
      tandem: Tandem.optional
    }, options );

    // compute max width of the items
    var maxWidth = 0;
    for ( var i = 0; i < items.length; i++ ) {
      maxWidth = Math.max( maxWidth, items[ i ].content.width );
    }

    // process each item
    var children = items.map( function( item ) {
      var offset = item.indent || 0;

      //Attach each item to an invisible strut to make the widths match.
      var content = new Path( Shape.rect( 0, 0, maxWidth + options.padding - offset, 0 ), { children: [ item.content ] } );
      var checkBox = new CheckBox( content, item.property, {
        checkBoxColor: options.checkBoxColor,
        boxWidth: options.boxWidth,
        tandem: item.tandem || Tandem.optional
      } );
      checkBox.mouseArea = checkBox.touchArea = Shape.bounds( checkBox.bounds.dilatedXY( 5, options.spacing / 2 ) );
      if ( item.indent ) {
        return new HBox( {
          children: [ new Rectangle( 0, 0, item.indent, 1 ), checkBox ]
        } );
      }
      else {
        return new HBox( { children: [ checkBox ] } );
      }
    } );

    options.children = children; //TODO bad form, if options.children was already set, then this will blow it away
    VBox.call( this, options );
  }

  sun.register( 'VerticalCheckBoxGroup', VerticalCheckBoxGroup );

  return inherit( VBox, VerticalCheckBoxGroup );
} );