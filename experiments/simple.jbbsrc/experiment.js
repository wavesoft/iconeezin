
(function(globals) {

	/**
	 * Experiment logic
	 */
	var LogicExperiment = function() {
		IconeezinAPI.Experiment.call(this);
	};

	/**
	 * Subclass from IconeezinAPI.Experiment
	 */
	LogicExperiment.prototype = Object.create( IconeezinAPI.Experiment );

	/**
	 * Expose to globals
	 */
	globals.LogicExperiment = LogicExperiment;

})(window);
