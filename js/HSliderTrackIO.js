// Copyright 2017, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var assertInstanceOf = require( 'ifphetio!PHET_IO/assertInstanceOf' );
  var NodeIO = require( 'SCENERY/nodes/NodeIO' );
  var phetioInherit = require( 'ifphetio!PHET_IO/phetioInherit' );
  var sun = require( 'SUN/sun' );

  /**
   * Wrapper type for phet/sun's HSliderTrack class.
   * @param hSliderTrack
   * @param phetioID
   * @constructor
   */
  function HSliderTrackIO( hSliderTrack, phetioID ) {
    assert && assertInstanceOf( hSliderTrack, phet.sun.HSliderTrack );
    NodeIO.call( this, hSliderTrack, phetioID );
  }

  phetioInherit( NodeIO, 'HSliderTrackIO', HSliderTrackIO, {}, {
    documentation: 'The track for a knob of a traditional slider'
  } );

  sun.register( 'HSliderTrackIO', HSliderTrackIO );

  return HSliderTrackIO;
} );