// Copyright 2014-2017, University of Colorado Boulder

/**
 * A round toggle button that switches the value of a property that can take on valueUp or valueDown.  It
 * sticks in the down position when pressed, popping back up when pressed
 * again.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundButtonView = require( 'SUN/buttons/RoundButtonView' );
  var StickyToggleButtonInteractionStateProperty = require( 'SUN/buttons/StickyToggleButtonInteractionStateProperty' );
  var StickyToggleButtonModel = require( 'SUN/buttons/StickyToggleButtonModel' );
  var sun = require( 'SUN/sun' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ToggleButtonIO = require( 'SUN/buttons/ToggleButtonIO' );

  /**
   * @param {Object} valueUp value when the toggle is in the 'up' position
   * @param {Object} valueDown value when the toggle is in the 'down' position
   * @param {Property} property axon property that can be either valueUp or valueDown.
   * @param {Object} [options]
   * @constructor
   */
  function RoundStickyToggleButton( valueUp, valueDown, property, options ) {

    options = _.extend( {
      tandem: Tandem.required,
      phetioType: ToggleButtonIO,

      // a11y
      tagName: 'input',
      inputType: 'button'
    }, options );

    // @private (read-only)
    // Note it shares a tandem with this, so the emitter will be instrumented as a child of the button
    this.toggleButtonModel = new StickyToggleButtonModel( valueUp, valueDown, property, options );
    RoundButtonView.call( this, this.toggleButtonModel, new StickyToggleButtonInteractionStateProperty( this.toggleButtonModel ), options );
  }

  sun.register( 'RoundStickyToggleButton', RoundStickyToggleButton );

  return inherit( RoundButtonView, RoundStickyToggleButton, {
    dispose: function() {
      this.toggleButtonModel.dispose(); //TODO this fails with assertions enabled, see sun#212
      RoundButtonView.prototype.dispose.call( this );
    }
  } );
} );