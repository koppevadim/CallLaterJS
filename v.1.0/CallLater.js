// Version 1.0
var CallLater = {
	// id
	id: {},
	count: {},
	//{delay: Number, tickcount: Number, onUpdate: function, onComplete: function}

	/**
	* Таймер с таким ключем запустить
	* @param func - одновременно и функция которую нужно запустить
	* @param ms - время в милисекундах
	* @param count - количество раз, которое нужно повторить, если параметр не передан,
	* то функция будет исполнаяться пока не выполнеться CallLater.finish
	* @returns key - ключ, по которому потом можно будет удалить таймер
	*/
	start: function (func, ms, count) {
		key = (Math.floor(Math.random() * (999999 - 1 + 1)) + 1);

		// Проверка на 2 одинаковых ключа
		CallLater.finish(key);

		CallLater.count[key] = 0;

		if (count === 1) {
			CallLater.id[key] = setTimeout(function () {
				CallLater.count[key]++;
				func();
				CallLater.finish(key);
			}, ms);
		} else {
			CallLater.id[key] = setInterval(function () {
				if (CallLater.count[key] !== count || count === 0 || typeof count === 'undefined') {
					CallLater.count[key]++;
					func();
				}
				if (CallLater.count[key] === count && count !== 0) {
					CallLater.finish(key);
				}
			}, ms);
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