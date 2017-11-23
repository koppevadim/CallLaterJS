// Version 1.1
// Новый вызов. Вызывается 2  разные функции на апдейт и на комплит.
var CallLater = {
	// id
	id: {},
	count: {},

	/**
	* Таймер с таким ключем запустить
	* @param delay - Через какой интервал будет срабатывать таймер. Обязательный параметр.
	* @param tick - Количество раз, которое сработает таймер. Не обязательный параметр.
	* @param onUpdate - Функция котороая вызывается при срабатывании таймера. Не обязательный параметр.
	* @param onUpdateParams - Параметры котороые передаются в функцию onUpdate. Не обязательный параметр.
	* @param onComplete - Функция котороая вызывается при последнем срабатывании таймера. Не обязательный параметр.
	* @param onCompleteParams - Параметры котороые передаются в функцию onComplete. Не обязательный параметр.
	* @returns key - сгенерированый ключ
	*/
	start: function ({ delay, tick, onUpdate, onUpdateParams, onComplete, onCompleteParams }) {
		var key = (Math.floor(Math.random() * (9999999 - 1 + 1)) + 1);

		if (typeof delay === 'undefined') {
			throw new Error('CallLater: delay: Обязательный параметр');

			return 0;
		}

		if (typeof onUpdate === 'undefined' && typeof onComplete === 'undefined') {
			throw new Error('CallLater: onUpdate и onComplete Обязательный должен быть указан');

			return 0;
		}

		// Проверка на 2 одинаковых ключа
		CallLater.finish(key);

		CallLater.count[key] = 0;

		if (tick === 1) {
			CallLater.id[key] = setTimeout(function () {
				CallLater.count[key]++;
				if (typeof onComplete !== 'undefined') {
					if (typeof onCompleteParams === 'undefined') {
						onComplete(CallLater.count[key]);
					} else {
						onComplete(onCompleteParams, CallLater.count[key]);
					}
				}
				CallLater.finish(key);
			}, delay);
		} else {
			CallLater.id[key] = setInterval(function () {
				if (CallLater.count[key] !== tick || tick === 0 || typeof tick === 'undefined') {
					CallLater.count[key]++;
					if (typeof onUpdate !== 'undefined') {
						if (typeof onUpdateParams === 'undefined') {
							onUpdate(CallLater.count[key]);
						} else {
							onUpdate(onUpdateParams, CallLater.count[key]);
						}
					}

				}
				if (CallLater.count[key] === tick && tick !== 0) {
					if (typeof onComplete !== 'undefined') {
						if (typeof onCompleteParams === 'undefined') {
							onComplete(CallLater.count[key]);
						} else {
							onComplete(onCompleteParams, CallLater.count[key]);
						}
					}
					CallLater.finish(key);
				}
			}, delay);
		}

		return key;
	},

	/**
	* Таймер с таким ключем удaлить
	* @param key - ключ по которму нужно удaлить
	* Если @param key не указан удаляем все
	*/
	finish: function (key) {
		if (typeof key !== 'undefined') {
			clearTimeout(CallLater.id[key]);
			clearInterval(CallLater.id[key]);

			delete CallLater.id[key];
			delete CallLater.count[key];
		} else {
			Object.keys(CallLater.id).forEach(function (key) {
				clearTimeout(CallLater.id[key]);
				clearInterval(CallLater.id[key]);

				delete CallLater.id[key];
				delete CallLater.count[key];
			});
		}
	},

	key: {
		/**
		 * Проверка таймера по ключу
		 * @param key - ключ по которому проверяеся существование
		 */
		exists: function (key) {
			return key in CallLater.id;
		},
	},
};