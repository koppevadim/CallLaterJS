//IMP: Version 1.2

// Теперь есть только один setInterval. Для оптимизации.
// Теперь все данные хранятся только в одном объекте. Для оптимизации.
// Теперь delay и amount имеют значения по умолчанию и их можно не указывать.
// Добавлена проперть CallLater.session.count() - возвращает количество таймеров
// Теперь ключ не генерируется, а просто к старому значению прибовляется один. Для оптимизации.

var CallLater = {
	key: 0,
	interval: 0,
	sessions: {},

	/**
	* Таймер с таким ключем запустить
	* @param {number} delay   - Через какой интервал будет срабатывать таймер. Обязательный параметр.
	* @param {number} amount - Количество раз, которое сработает таймер. Не обязательный параметр.
	* @param {function} onUpdate - Функция котороая вызывается при срабатывании таймера. Не обязательный параметр.
	* @param {any} onUpdateParams - Параметры котороые передаются в функцию onUpdate. Не обязательный параметр.
	* @param {function} onComplete - Функция котороая вызывается при последнем срабатывании таймера. Не обязательный параметр.
	* @param {any} onCompleteParams - Параметры котороые передаются в функцию onComplete. Не обязательный параметр.
	* @returns {number} key - сгенерированый ключ
	*/
	start: function ({ onUpdate, onComplete, onUpdateParams, onCompleteParams, amount = 0, delay = 1000 }) {
		CallLater.key++;

		if (typeof onUpdate === 'undefined' && typeof onComplete === 'undefined') {
			throw new Error('onUpdate and/or onComplete must be set');

			return 0;
		}

		CallLater.sessions[CallLater.key] = {};
		CallLater.sessions[CallLater.key].count = 0;
		CallLater.sessions[CallLater.key].delay = delay;
		CallLater.sessions[CallLater.key].time = new Date().getTime();

		CallLater.sessions[CallLater.key].id = function () {
			CallLater.sessions[CallLater.key].time = new Date().getTime();
			if (CallLater.sessions[CallLater.key].count !== amount || amount === 0 || typeof amount === 'undefined') {
				CallLater.sessions[CallLater.key].count++;
				if (typeof onUpdate !== 'undefined') {
					onUpdate(CallLater.sessions[CallLater.key].count, onUpdateParams);
				}
			}
			if (CallLater.sessions[CallLater.key].count === amount && amount !== 0) {
				if (typeof onComplete !== 'undefined') {
					onComplete(CallLater.sessions[CallLater.key].count, onCompleteParams);
				}
				CallLater.finish(CallLater.key);
			}
		};

		if (CallLater.interval === 0) {
			CallLater.interval = setInterval(CallLater.onInterval, 50);
		}

		return CallLater.key;
	},

	onInterval: function () {
		for (var key in CallLater.sessions) {
			if (CallLater.sessions[key].delay <= (new Date().getTime() - CallLater.sessions[key].time)) {
				CallLater.sessions[key].id();
			}
		}
	},

	/**
	* Таймер с таким ключем удaлить
	* @param key - ключ по которму нужно удaлить
	* Если @param key не указан удаляем все
	*/
	finish: function (key) {
		if (typeof key !== 'undefined') {
			delete CallLater.sessions[key];
		} else {
			for (var key in CallLater.sessions) {
				delete CallLater.sessions[key];
			};
		}

		if (CallLater.session.count() === 0) {
			clearInterval(CallLater.interval);
			CallLater.interval = 0;
		}
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
		count: function () {
			return Object.keys(CallLater.sessions).length;
		}
	},
};