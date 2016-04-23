(function main() {
    'use strict';

    // Helpers
    function json(string) {
        return new Promise(function resolver(resolve, reject) {
            try {
                resolve(JSON.parse(string));
            } catch (e) {
                reject(e);
            }
        });
    }
    function fetch(url) {
        return new Promise(function resolver(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status < 400) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            };
            xhr.send(null)
        });
    }
    function getTimeString(ISOString) {
        var date = new Date(ISOString);
        var hh = date.getHours();
        var mm = date.getMinutes();

        if (hh < 10) {
            hh = '0' + hh;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }

        return [hh, mm].join(':');
    }
    function emulatePastEvent(ISOString, now) {
        var eventDate = new Date(ISOString);

        return eventDate.getHours()*60 + eventDate.getMinutes() < now.getHours()*60 + now.getMinutes();
    }
    function parseData(data) {
        var result = {
            weekdays: [
                { name: 'Пн', date: 11 },
                { name: 'Вт', date: 12 },
                { name: 'Ср', date: 13 },
                { name: 'Чт', date: 14 },
                { name: 'Пт', date: 15 },
                { name: 'Сб', date: 16 },
                { name: 'Вс', date: 17 }
            ]
        };
        var now = new Date();

        result.channels = data.channels.map(function(channel) {
            var resultChannel = {};

            resultChannel.id = channel.id;
            resultChannel.name = channel.name;
            resultChannel.description = channel.description;
            resultChannel.logo = channel.images[0];
            resultChannel.events = channel.events.map(function(event) {
                return {
                    id: event.id,
                    start_at: event.start_at,
                    start_at_time: getTimeString(event.start_at),
                    end_at: event.end_at,
                    end_at_time: getTimeString(event.end_at),
                    past: emulatePastEvent(event.end_at, now),
                    name: event.name,
                    description: event.description,
                    season_number: event.season_number,
                    images: event.images
                };
            });

            return resultChannel;
        });

        return result;
    }
    function delegate(elements, event, className, callback) {
        [].forEach.call(elements, function(el) {
            el.addEventListener(event, function(e) {
                var current = e.target;
                while(current !== e.currentTarget) {
                    if (current.classList.contains(className)) {
                        callback.call(current,e.currentTarget, e);
                    }
                    current = current.parentNode;
                }
            })
        });
    }
    

    function init(result) {
        var data = parseData(result[0]);
        var template = result[1];
        var appContainer = document.querySelector('.container');

        appContainer.innerHTML = Mustache.render(template, data);

        delegate(
            document.querySelectorAll('.channel'),
            'click',
            'event',
            getEventInfo
        );

        function getEventInfo(channelEl) {
            var channelData = data.channels.filter(function(channel) {
                return channel.id === channelEl.dataset.id;
            })[0];
            var eventData = channelData.events.filter(function(event) {
                return event.id === this.dataset.id;
            }, this)[0];
            console.log(eventData);
        }
    }

    Promise.all([
        fetch('src/data/data.json').then(json),
        fetch('src/template/main.mustache')
    ])
        .then(init)
        .catch(function onRejection(e) {
            console.error(e);
        });
})();
