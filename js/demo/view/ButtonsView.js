// Copyright 2002-2014, University of Colorado Boulder

/**
 * Main ScreenView container for Buttons portion of the UI component demo.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var OutsideBackgroundNode = require( 'SCENERY_PHET/OutsideBackgroundNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RectangularPushButton = require( 'SUN/experimental/buttons/RectangularPushButton' );
  var RefreshButton = require( 'SUN/experimental/buttons/RefreshButton' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );
  var ResetAllButton2 = require( 'SUN/experimental/buttons/ResetAllButton2' );
  var ReturnToLevelSelectButton = require( 'SUN/experimental/buttons/ReturnToLevelSelectButton' );
  var RoundPushButton = require( 'SUN/experimental/buttons/RoundPushButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SoundToggleButton2 = require( 'SUN/experimental/buttons/SoundToggleButton2' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TimerToggleButton2 = require( 'SUN/experimental/buttons/TimerToggleButton2' );
  var ToggleButton2 = require( 'SUN/experimental/buttons/ToggleButton2' );

  // Constants
  var BUTTON_FONT = new PhetFont( { size: 20 } );
  var BUTTON_CAPTION_FONT = new PhetFont( { size: 16 } );

  function ButtonsView() {
    ScreenView.call( this, { renderer: 'svg' } );

    // background
    this.addChild( new OutsideBackgroundNode( this.layoutBounds.centerX, this.layoutBounds.centerY + 20, this.layoutBounds.width * 3, this.layoutBounds.height, this.layoutBounds.height ) );
    // Set up a property for testing button enable/disable.
    var buttonsEnabled = new Property( true );

    // convenience vars for layout
    var rightEdge = this.layoutBounds.width * 0.6;
    var buttonSpacing = 10;

    // Text area for outputting test information
    var outputText = new Text( '(output text)', { font: new PhetFont( 16 ), bottom: this.layoutBounds.height - 5, left: this.layoutBounds.minX + 10  } );
    this.addChild( outputText );

    // add refresh button and caption
    var refreshButton = new RefreshButton(
      {
        listener: function() { outputText.text = 'Refresh pressed'; },
        right: rightEdge,
        top: 10
      } );
    this.addChild( refreshButton );
    var refreshButtonLabel = new Text( 'Refresh Button: ', { font: BUTTON_CAPTION_FONT, right: refreshButton.left - 5, centerY: refreshButton.centerY } );
    this.addChild( refreshButtonLabel );

    // add return to level select button and caption
    var returnToLevelSelectButton = new ReturnToLevelSelectButton(
      {
        listener: function() { outputText.text = 'Return to level select pressed'; },
        centerX: refreshButton.centerX,
        top: refreshButton.bottom + buttonSpacing
      } );
    this.addChild( returnToLevelSelectButton );
    var returnToLevelSelectButtonLabel = new Text( 'Return to Level Selection Button: ', { font: BUTTON_CAPTION_FONT, right: returnToLevelSelectButton.left - 5, centerY: returnToLevelSelectButton.centerY } );
    this.addChild( returnToLevelSelectButtonLabel );

    // add sound toggle button
    var soundEnabled = new Property( true );
    var soundToggleButton = new SoundToggleButton2( soundEnabled, { centerX: refreshButton.centerX, top: returnToLevelSelectButton.bottom + buttonSpacing } );
    this.addChild( soundToggleButton );
    var soundToggleButtonLabel = new Text( 'Sound Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: soundToggleButton.left - 5, centerY: soundToggleButton.centerY } );
    this.addChild( soundToggleButtonLabel );

    // add timer toggle button
    var timerEnabled = new Property( true );
    var timerToggleButton = new TimerToggleButton2( timerEnabled, { centerX: refreshButton.centerX, y: soundToggleButton.bottom + 5 } );
    this.addChild( timerToggleButton );
    var timerToggleButtonLabel = new Text( 'Timer Toggle Button: ', { font: BUTTON_CAPTION_FONT, right: timerToggleButton.left - 5, centerY: timerToggleButton.centerY } );
    this.addChild( timerToggleButtonLabel );

    // add reset all button and caption
    var resetAllButton = new ResetAllButton( function() {
        outputText.text = 'Reset All pressed';
        buttonsEnabled.reset();
        soundEnabled.reset();
        timerEnabled.reset();
      },
      { radius: 22, centerX: refreshButton.centerX, top: timerToggleButton.bottom + buttonSpacing } );
    this.addChild( resetAllButton );
    var resetAllButtonLabel = new Text( 'Reset All Button: ', { font: BUTTON_CAPTION_FONT, right: resetAllButton.left - 5, centerY: resetAllButton.centerY } );
    this.addChild( resetAllButtonLabel );

    // Test button behavior.
    var buttonA = new RectangularPushButton(
      new Text( '--- A ---', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button A pressed'; },
        left: 100,
        top: 300
      } );
    this.addChild( buttonA );

    var buttonB = new RectangularPushButton(
      new Text( '--- B ---', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button B pressed'; },
        left: buttonA.right + 10,
        centerY: buttonA.centerY,
        baseColor: new Color( 250, 0, 0 )
      } );
    this.addChild( buttonB );

    var fireCount = 0;
    var buttonC = new RectangularPushButton(
      new Text( '--- C ---', { font: BUTTON_FONT } ),
      {
        listener: function() {
          outputText.text = 'Button C pressed ' + fireCount;
          fireCount++;
        },
        left: buttonB.right + 10,
        centerY: buttonB.centerY,
        baseColor: new Color( 204, 102, 204 )
      } );
    this.addChild( buttonC );

    var fireOnDownButton = new RectangularPushButton(
      new Text( 'Fire on Down Button', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Fire on down button pressed'; },
        left: buttonC.right + 30,
        centerY: buttonC.centerY,
        baseColor: new Color( 255, 255, 61 ),
        fireOnDown: true
      } );
    this.addChild( fireOnDownButton );

    var buttonEnableButton = new ToggleButton2(
      new Text( 'Disable Buttons', { font: BUTTON_CAPTION_FONT } ),
      new Text( 'Enable Buttons', { font: BUTTON_CAPTION_FONT } ),
      buttonsEnabled,
      { baseColor: new Color( 204, 255, 51 ), left: buttonA.left, top: buttonA.bottom + 30 }
    );
    this.addChild( buttonEnableButton );

    // add alternative reset all button
    var resetAllButton2 = new ResetAllButton2(
      {
        radius: 30,
        centerX: buttonC.centerX,
        centerY: buttonEnableButton.centerY,
        listener: function() {
          outputText.text = 'Reset All pressed';
          buttonsEnabled.reset();
          soundEnabled.reset();
          timerEnabled.reset();
        }
      } );
    this.addChild( resetAllButton2 );

    var buttonD = new RoundPushButton(
      new Text( '- D -', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button D pressed'; },
        left: resetAllButton2.right + buttonSpacing,
        centerY: resetAllButton2.centerY
      } );
    this.addChild( buttonD );

    var buttonE = new RoundPushButton(
      new Text( '-- E --', { font: BUTTON_FONT } ),
      {
        listener: function() { outputText.text = 'Button E pressed'; },
        baseColor: new Color( 245, 184, 0 ),
        left: buttonD.right + buttonSpacing,
        centerY: buttonD.centerY
      } );
    this.addChild( buttonE );

    var goButton = new RoundPushButton(
      new Text( 'Go!', { font: new PhetFont( { size: 30, weight: 'bold' } ), fill: 'white' } ),
      {
        listener: function() { outputText.text = 'Go button pressed'; },
        baseColor: new Color( 0, 163, 0 ),
        minXPadding: 10,
        left: buttonE.right + buttonSpacing,
        centerY: buttonE.centerY
      } );
    this.addChild( goButton );

    // Hook up button enable property
    buttonsEnabled.link( function( enabled ) {
      buttonA.enabled = enabled;
      buttonB.enabled = enabled;
      buttonC.enabled = enabled;
      buttonD.enabled = enabled;
      buttonE.enabled = enabled;
      goButton.enabled = enabled;
      fireOnDownButton.enabled = enabled;
      refreshButton.enabled = enabled;
      returnToLevelSelectButton.enabled = enabled;
      soundToggleButton.enabled = enabled;
      timerToggleButton.enabled = enabled;
    } );

    // TODO: For debug, don't leave this here long term.
    var debugText = new Text( '(debug text)', { font: new PhetFont( 16 ), bottom: outputText.top - 5, left: this.layoutBounds.minX + 10  } );
    this.addChild( debugText );
    window.debugText = debugText;
  }

  return inherit( ScreenView, ButtonsView, {
    step: function( timeElapsed ) {
      // Does nothing for now.
    }
  } );
} );
