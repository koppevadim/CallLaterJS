//IMP: Version 1.3.1

// Теперь параметры для onUpdate и onComplete принимают массив данных.
// Добавлена возможность менять все параметры ссесии на лету.
// Исправлена функция reset. Теперь сбрасывается и пауза, если она была установлена.

var CallLater = {
	//region Свойства
	key: 0,
	interval: 0,
	sessions: {},
	options: {speed: 50},
	//endregion

	//region Публичные функции
	/**
	* Таймер с таким ключем запустить
	* @param {number} delay   - Через какой интервал будет срабатывать таймер. Обязательный параметр.
	* @param {number} amount - Количество раз, которое сработает таймер. Не обязательный параметр.
	* @param {number} autodelete - Удоление сессии таймера после выполнения всех условий.
	* @param {function} onUpdate - Функция котороая вызывается при срабатывании таймера. Не обязательный параметр.
	* @param {Array} onUpdateParams - Параметры котороые передаются в функцию onUpdate. Не обязательный параметр.
	* @param {function} onComplete - Функция котороая вызывается при последнем срабатывании таймера. Не обязательный параметр.
	* @param {Array} onCompleteParams - Параметры котороые передаются в функцию onComplete. Не обязательный параметр.
	* @returns {number} key - сгенерированый ключ
	*/
	start: function({onUpdate, onComplete, onUpdateParams, onCompleteParams, amount = 0, delay = 1000, autodelete = true} = {})
	{
		CallLater.key++;

		if(typeof onUpdate === 'undefined' && typeof onComplete === 'undefined')
		{
			throw new Error('onUpdate and/or onComplete must be set');

			return 0;
		}

		CallLater.sessions[CallLater.key] = {};
		CallLater.sessions[CallLater.key].count = 0;
		CallLater.sessions[CallLater.key].delay = delay;
		CallLater.sessions[CallLater.key].pause = false;
		CallLater.sessions[CallLater.key].complete = false;
		CallLater.sessions[CallLater.key].time = Date.now();
		CallLater.sessions[CallLater.key].autodelete = autodelete;

		CallLater.sessions[CallLater.key].onUpdate = onUpdate;
		CallLater.sessions[CallLater.key].onComplete = onComplete;
		CallLater.sessions[CallLater.key].onUpdateParams = onUpdateParams;
		CallLater.sessions[CallLater.key].onCompleteParams = onCompleteParams;

		CallLater.sessions[CallLater.key].func = function()
		{
			CallLater.sessions[CallLater.key].time = Date.now();

			if(CallLater.sessions[CallLater.key].count !== amount || amount === 0 || typeof amount === 'undefined')
			{
				CallLater.sessions[CallLater.key].count++;
			}

			if(CallLater.sessions[CallLater.key].count === amount && amount !== 0)
			{

				CallLater.sessions[CallLater.key].complete = true;

				if(typeof onComplete !== 'undefined')
				{
					CallLater.sessions[CallLater.key].onComplete(
						CallLater.sessions[CallLater.key],
						CallLater.sessions[CallLater.key].onCompleteParams);
				}

				if(CallLater.sessions[CallLater.key].autodelete)
				{
					CallLater.session.kill.key(CallLater.key);
				}
			} else if(typeof onUpdate !== 'undefined')
			{
				CallLater.sessions[CallLater.key].onUpdate(
					CallLater.sessions[CallLater.key],
					CallLater.sessions[CallLater.key].onUpdateParams);
			}
		};

		if(CallLater.interval === 0)
		{
			CallLater.interval = setInterval(CallLater.onInterval, CallLater.options.speed);
		}

		return CallLater.key;
	},

	session: {
		/**
		 * Проверка таймера по ключу
		 * @param key - ключ по которому проверяеся существование
		 * @returns true/false
		 */
		exists: function(key)
		{
			return Boolean(CallLater.sessions[key]);
		},

		/**
		 * Количество таймеров
		 * @returns количество
		 */
		get count()
		{
			return Object.keys(CallLater.sessions).length;
		},

		/**
		 * Проверка на то что таймер закончил все условия либо еще выполняется.
		 * @returns количество
		 */
		complete: function(key)
		{
			return CallLater.sessions[key].complete;
		},

		isPaused: function(key)
		{
			return CallLater.sessions[key].pause;
		},

		pause: function(key)
		{
			if(!CallLater.sessions[key].pause)
			{
				CallLater.sessions[key].pause = true;
				CallLater.sessions[key].pausetime = Date.now() - CallLater.sessions[key].time;
			}
		},

		resume: function(key)
		{
			if(CallLater.sessions[key].pause)
			{
				CallLater.sessions[key].pause = false;
				CallLater.sessions[CallLater.key].time = Date.now() - CallLater.sessions[key].pausetime;

				delete CallLater.sessions[key].pausetime;
			}
		},

		reset: function(key)
		{
			CallLater.session.resume(key);

			CallLater.sessions[CallLater.key].time = Date.now();
			CallLater.sessions[CallLater.key].count = 0;
		},

		change: {

			delay: function(key, delay)
			{
				CallLater.sessions[key].delay = delay;
			},

			update: function(key, func)
			{
				CallLater.sessions[key].onUpdate = func;
			},

			updateParams: function(key, args)
			{
				CallLater.sessions[key].onUpdateParams = args;
			},

			complete: function(key, func)
			{
				CallLater.sessions[key].onComplete = func;
			},

			completeParams: function(key, args)
			{
				CallLater.sessions[key].onCompleteParams = args;
			},
		},

		/**
		* Удаление сессии таймера
		*/
		kill: {
			/**
			* Все
			*/
			all: function()
			{
				for(var key in CallLater.sessions)
				{
					delete CallLater.sessions[key];
				}

				if(CallLater.session.count === 0)
				{
					CallLater.session.kill.interval();
				}
			},
			/**
			* Конкретный
			*/
			key: function(key)
			{
				delete CallLater.sessions[key];

				if(CallLater.session.count === 0)
				{
					CallLater.session.kill.interval();
				}
			},

			/**
			* Интервал
			*/
			interval: function()
			{
				clearInterval(CallLater.interval);
				CallLater.interval = 0;
			},
		},
	},
	//endregion

	//region Обработчик таймера. Приватная функция
	onInterval: function()
	{
		for(var key in CallLater.sessions)
		{
			if(!CallLater.sessions[key].pause && CallLater.sessions[key].delay <= Date.now() - CallLater.sessions[key].time)
			{
				CallLater.sessions[key].func();
			}
		}
	},
	//endregion
};