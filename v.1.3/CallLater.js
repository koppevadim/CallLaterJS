//IMP: Version 1.3

// >>>>>>Для большего контроля над сессией таймера<<<<<<
// Добавлена проперть autodelete.
// Добавлена проперть running.
// onUpdate и onComplete теперь возвращают весь объект сессии.
// Изменена функция удaления сессии таймера, есть функция очистки конкретной сессии, всех сессий, и остановка таймера. CallLater.session.kill.all()
// Добавлена возможность паузы и снятия паузы сессии.
// Теперь когда amount указан, последний раз не происхлдит вызов и onUpdate и onComplete, а только onComplete.
// Добавлен reset сессии.

var CallLater = {
	//region Свойства
	key: 0,
	interval: 0,
	sessions: {},
	//endregion

	//region Публичные функции
	/**
	* Таймер с таким ключем запустить
	* @param {number} delay   - Через какой интервал будет срабатывать таймер. Обязательный параметр.
	* @param {number} amount - Количество раз, которое сработает таймер. Не обязательный параметр.
	* @param {number} autodelete - Удоление сессии таймера после выполнения всех условий.
	* @param {function} onUpdate - Функция котороая вызывается при срабатывании таймера. Не обязательный параметр.
	* @param {any} onUpdateParams - Параметры котороые передаются в функцию onUpdate. Не обязательный параметр.
	* @param {function} onComplete - Функция котороая вызывается при последнем срабатывании таймера. Не обязательный параметр.
	* @param {any} onCompleteParams - Параметры котороые передаются в функцию onComplete. Не обязательный параметр.
	* @returns {number} key - сгенерированый ключ
	*/
	start: function ({ onUpdate, onComplete, onUpdateParams, onCompleteParams, amount = 0, delay = 1000, autodelete = true }) {
		CallLater.key++;

		if (typeof onUpdate === 'undefined' && typeof onComplete === 'undefined') {
			throw new Error('onUpdate and/or onComplete must be set');

			return 0;
		}

		CallLater.sessions[CallLater.key] = {};
		CallLater.sessions[CallLater.key].count = 0;
		CallLater.sessions[CallLater.key].delay = delay;
		CallLater.sessions[CallLater.key].pause = false;
		CallLater.sessions[CallLater.key].complete = false;
		CallLater.sessions[CallLater.key].autodelete = autodelete;
		CallLater.sessions[CallLater.key].time = new Date().getTime();

		CallLater.sessions[CallLater.key].func = function () {
			CallLater.sessions[CallLater.key].time = new Date().getTime();

			if (CallLater.sessions[CallLater.key].count !== amount || amount === 0 || typeof amount === 'undefined') {
				CallLater.sessions[CallLater.key].count++;
			}

			if (CallLater.sessions[CallLater.key].count === amount && amount !== 0) {

				CallLater.sessions[CallLater.key].complete = true;

				if (typeof onComplete !== 'undefined') {
					onComplete(CallLater.sessions[CallLater.key], onCompleteParams);
				}

				if (CallLater.sessions[CallLater.key].autodelete) {
					CallLater.session.kill.key(CallLater.key);
				}
			} else if (typeof onUpdate !== 'undefined') {
				onUpdate(CallLater.sessions[CallLater.key], onUpdateParams);
			}
		};

		if (CallLater.interval === 0) {
			CallLater.interval = setInterval(CallLater.onInterval, 50);
		}

		return CallLater.key;
	},

	session: {
		/**
		 * Проверка таймера по ключу
		 * @param key - ключ по которому проверяеся существование
		 * @returns key
		 */
		exists: function (key) {
			return key in CallLater.sessions;
		},

		/**
		 * Количество таймеров
		 * @returns количество
		 */
		get count() {
			return Object.keys(CallLater.sessions).length;
		},

		/**
		 * Проверка на то что таймер закончил все условия либо еще выполняется.
		 * @returns количество
		 */
		complete: function (key) {
			return CallLater.sessions[key].complete;
		},

		isPaused: function (key) {
			return CallLater.sessions[key].pause;
		},

		set: {
			pause: function (key) {
				CallLater.sessions[key].pause = true;
			},

			unpause: function (key) {
				CallLater.sessions[key].pause = false;
				CallLater.sessions[CallLater.key].time = new Date().getTime();
			},
		},

		reset: function (key) {
			CallLater.sessions[CallLater.key].time = new Date().getTime();
			CallLater.sessions[CallLater.key].count = 0;
		},

		/**
		* Удаление сессии таймера
		*/
		kill: {
			/**
			* Все
			*/
			all: function () {
				for (var key in CallLater.sessions) {
					delete CallLater.sessions[key];
				}

				if (CallLater.session.count === 0) {
					CallLater.session.kill.interval();
				}
			},
			/**
			* Конкретный
			*/
			key: function (key) {
				delete CallLater.sessions[key];

				if (CallLater.session.count === 0) {
					CallLater.session.kill.interval();
				}
			},

			/**
			* Интервал
			*/
			interval: function () {
				clearInterval(CallLater.interval);
				CallLater.interval = 0;
			},
		},
	},
	//endregion

	//region Обработчик таймера. Приватная функция
	onInterval: function () {
		for (var key in CallLater.sessions) {
			if (!CallLater.sessions[key].pause && CallLater.sessions[key].delay <= (new Date().getTime() - CallLater.sessions[key].time)) {
				CallLater.sessions[key].func();
			}
		}
	},
	//endregion
};