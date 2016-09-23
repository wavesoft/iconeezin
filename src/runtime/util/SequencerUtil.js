var THREE = require('three');
var StopableTimers = require("./StopableTimers");
var AudioCore = require("../core/AudioCore");

var activeSequences = [ ];

var Sequence = function(parent) {

  // Create two-directional binding
  this._parent = parent;
  this._next = null;
  this._interrupted = false;

  // The actions
  this._continueCallback = null;
}

/**
 * Play an audio object and continue when completed
 */
Sequence.prototype.playAudio = function( audio_file ) {
  if (this._parent) this._parent._next = this;
  this._continueCallback = (function( next_cb ) {

    // De-bounce action
    setTimeout(function() {

      // Create a new audio file instance and play when ready
      var instance = audio_file.create(function() {
        instance.play();
      });

      // Make resetable with custom pause hook
      var ignoreEnded = false;
      instance.pause = function() {
        ignoreEnded = true;
        THREE.Audio.prototype.pause.call(instance);
      }
      instance.play = function() {
        ignoreEnded = false;
        THREE.Audio.prototype.play.call(instance);
      }

      // Wait for it to complete and go to next task
      instance.source.onended = function() {
        THREE.Audio.prototype.onEnded.call(instance);
        if (!ignoreEnded) next_cb();
      }

      // Make resetable
      AudioCore.makeResetable( instance );

    }, 1);

    return this._next;

  }).bind(this);

  return new Sequence(this);
}

/**
 * Take the action and continue
 */
Sequence.prototype.do = function( action_cb ) {
  if (this._parent) this._parent._next = this;
  this._continueCallback = (function( next_cb ) {

    // De-bounce action
    setTimeout(function() {
      action_cb();
      next_cb();
    }, 1);

    return this._next;

  }).bind(this);

  return new Sequence(this);
}

/**
 * Run the specified callback and wait for it to call the completion callback
 */
Sequence.prototype.waitFor = function( action_cb ) {
  if (this._parent) this._parent._next = this;
  this._continueCallback = (function( next_cb ) {

    // De-bounce action
    setTimeout(function() {
      action_cb( next_cb );
    }, 1);

    return this._next;

  }).bind(this);

  return new Sequence(this);
}

/**
 * Pause execution for the specified number of milliseconds
 */
Sequence.prototype.sleep = function( sleep_ms ) {
  if (this._parent) this._parent._next = this;
  this._continueCallback = (function( next_cb ) {

    StopableTimers.setTimeout( next_cb, sleep_ms );
    return this._next;

  }).bind(this);

  return new Sequence(this);
}

/**
 * Take a decision and possibly return a new
 */
Sequence.prototype.select = function( decision_fn ) {
  if (this._parent) this._parent._next = this;
  this._continueCallback = (function( next_cb ) {

    // Take a decision and get the correct next item
    var forkSequence = new Sequence();
    decision_fn( forkSequence );

    // Find the last leaf of forked sequence
    var leafSequence = forkSequence;
    while (leafSequence._next) {
      leafSequence = leafSequence._next;
    }

    // Chain my current next on the leaf of that sequence
    leafSequence._next = this._next;
    if (this._next) {
      this._next._parent = leafSequence;
    }

    // De-bounce next callback to continue
    setTimeout( next_cb, 1 );

    // Return forked sequence
    return forkSequence;

  }).bind(this);

  return new Sequence(this);
}

/**
 * Start the sequence
 */
Sequence.prototype.start = function( completed_cb ) {
  var root = this;
  while (root._parent !== undefined) {
    root = root._parent;
  }

  // Mark on active
  activeSequences.push(this);

  // Asynchronous callback for continuing the sequence
  var action = root;
  var continueSequence = function() {
    var idOnActive = activeSequences.indexOf(this);

    // Check root for interruptions
    if (root._interrupted) {
      if (idOnActive >= 0)
        activeSequences.splice(idOnActive, 1);
      return;
    }

    // If we have no more actions, call the completion callback
    if (!action) {
      if (idOnActive >= 0)
        activeSequences.splice(idOnActive, 1);
      if (completed_cb) completed_cb();
      return;
    }

    // Call the next function to continue, and ask it to provide
    // us with the next task in chain.
    action = action._continueCallback(continueSequence);

  };

  // Start sequence
  continueSequence();

};

/**
 * Interrupt sequence
 */
Sequence.prototype.stop = function() {
  var root = this;
  while (root._parent !== undefined) {
    root = root._parent;
  }

  // Interrupt all tasks, starting from root and walking into
  // all children
  var interruptTask = root;
  while (interruptTask) {
    interruptTask._interrupted = true;
    interruptTask = interruptTask._next;
  }
};

module.exports = {

  /**
   * Expose the creation of new root sequencer
   */
  createSequence: function() {
    return new Sequence();
  },

  /**
   * Get active sequences
   */
  getActiveSequences: function() {
    return activeSequences;
  },

  /**
   * Reset all active sequences
   */
  reset: function() {
    // Stop all sequences
    activeSequences.forEach(function(sequence) {
      sequence.stop();
    });

    // Remove from list
    activeSequences = [];
  }

}
