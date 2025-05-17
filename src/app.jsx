import React, { useState, useRef } from "react";

const pickupPoints = [
  { name: "Мария", address: "Боровское шоссе, д.2к7", coords: [55.661496, 37.415622], phone: "+79639764558", nearestMetro: "Говорово", type: "volunteer" },
  { name: "Елена", address: "ул. Кусковская, д.17", coords: [55.739407, 37.777419], phone: "+79032322433", nearestMetro: "Перово", type: "volunteer" },
  { name: "Дарья", address: "Варшавское шоссе, д.141к13", coords: [55.587779, 37.603415], phone: "+79104742988", nearestMetro: "Аннино", type: "volunteer" },
  { name: "Елена", address: "Болотниковская улица, 10А", coords: [55.657306, 37.609991], phone: "+79169798613", nearestMetro: "Нахимовский проспект", type: "volunteer" },
  { name: "Галина", address: "ул. Константина Федина, д 8", coords: [55.805827, 37.794064], phone: "+79169810644", nearestMetro: "Щёлковская", type: "volunteer" },
  { name: "Анастасия", address: "2-я Хуторская улица, д. 18к2", coords: [55.806762, 37.575109], phone: "+79262113585", nearestMetro: "Дмитровская", type: "volunteer" },
  { name: "Янош", address: "Ленинский проспект, д.93", coords: [55.675245, 37.527920], phone: "+79031637020", nearestMetro: "Новаторская", type: "volunteer" },
  { name: "Хитрый нос", address: "Ярославское шоссе 12к2", coords: [55.854517, 37.683060], workingHours: "10:00-22:00. Передать помощь в данный пункт сбора можно в часы работы магазина без каких-либо предварительных договорённостей", nearestMetro: "Ростокино", type: "shop" },
  { name: "Dr.Vetson", address: "Балаклавский проспект, д. 9", coords: [55.641122, 37.595501], workingHours: "круглосуточно. Передать помощь в данный пункт сбора можно в любое удобное время без каких-либо предварительных договорённостей", nearestMetro: "Чертановская", type: "vet" },
  { name: "Dr.Hug", address: "ул. Малая Филёвская, д.12к1", coords: [55.738302, 37.472917], workingHours: "круглосуточно. Передать помощь в данный пункт сбора можно в любое удобное время без каких-либо предварительных договорённостей", nearestMetro: "Пионерская", type: "vet" },
  { name: "Dr.Hug", address: "Хорошёвское шоссе, д. 38Дс3", coords: [55.781003, 37.537550], workingHours: "круглосуточно. Передать помощь в данный пункт сбора можно в любое удобное время без каких-либо предварительных договорённостей", nearestMetro: "ЦСКА", type: "vet" },
  { name: "Синица", address: "ул. Маршала Неделина, д.16с5", coords: [55.724403, 37.410654], workingHours: "9:00-21:00. Передать помощь в данный пункт сбора можно в часы работы клиники без каких-либо предварительных договорённостей", nearestMetro: "Молодежная", type: "vet" },
  { name: "Пара капибар", address: "ул.Народного ополчения, д.48к1", coords: [55.794032, 37.495078], workingHours: "круглосуточно. Передать помощь в данный пункт сбора можно в любое удобное время без каких-либо предварительных договорённостей", nearestMetro: "Октябрьское поле", type: "vet" },
  { name: "Лама рядом", address: "ул.Гродненская, д.10", coords: [55.718076, 37.433597], workingHours: "круглосуточно. Передать помощь в данный пункт сбора можно в любое удобное время без каких-либо предварительных договорённостей", nearestMetro: "Давыдково", type: "vet" },
  { name: "Наш офис", address: "ул.Коцюбинского, д.4", coords: [55.728591, 37.431235], workingHours: "10:00-18:00 по будним дням. Перед приездом просим вас согласовать время посещения в ответном письме или по телефону офиса: +79850667749", nearestMetro: "Кунцевская", type: "office" }
];

const toRad = (val) => (val * Math.PI) / 180;
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const fetchCoords = async (stationName) => {
  const apiKey = "74796fe5-c44e-403a-b715-a6e954b3118e";
  const url = `https://geocode-maps.yandex.ru/1.x/?format=json&apikey=${apiKey}&geocode=метро ${encodeURIComponent(stationName)}, Москва`;
  const res = await fetch(url);
  const data = await res.json();
  const pos = data.response.GeoObjectCollection.featureMember[0].GeoObject.Point.pos;
  const [lon, lat] = pos.split(" ").map(Number);
  return [lat, lon];
};

const NearestPickupPoint = () => {
  const [station, setStation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [copied, setCopied] = useState(false);
  const letterRef = useRef(null);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const stationCoords = await fetchCoords(station);
      const distances = pickupPoints.map((p) => ({ ...p, distance: haversineDistance(stationCoords, p.coords) }));
      const sorted = distances.sort((a, b) => a.distance - b.distance);
      const nearestPoints = sorted[0].distance <= 1.5 ? [sorted[0]] : sorted.slice(0, 2);
      setResult({ nearestPoints: nearestPoints.map((p) => ({ ...p, distance: p.distance.toFixed(2) })) });
    } catch {
      alert("Ошибка при геокодировании станции.");
    }
    setLoading(false);
  };

  const generateLetter = () => {
    if (!result) return "";
    let volunteerCount = 0;
    const letterBody = result.nearestPoints
      .map((point) => {
        switch (point.type) {
          case "volunteer":
            volunteerCount += 1;
            return `- у нашего волонтёра в районе м. ${point.nearestMetro}, контакт: ${point.phone}, ${point.name}.`;
          case "vet":
            return `- в ветеринарной клинике \"${point.name}\" по адресу ${point.address}, режим работы: ${point.workingHours}.`;
          case "shop":
            return `- в зоомагазине \"${point.name}\" по адресу ${point.address}, режим работы: ${point.workingHours}.`;
          case "office":
            return `- в офисе нашего фонда по адресу ${point.address}, часы работы: ${point.workingHours}.`;
          default:
            return `- в пункте сбора \"${point.name}\" по адресу ${point.address}.`;
        }
      })
      .join("\n");

    let volunteerMessage = "";
    if (volunteerCount === 1) {
      volunteerMessage = "Не затруднит ли вас связаться с волонтёром самостоятельно, чтобы согласовать все детали напрямую? При обращении можно сказать, что контакт вам дали в фонде 'РЭЙ'.";
    } else if (volunteerCount === 2) {
      volunteerMessage = "Не затруднит ли вас связаться с выбранным волонтёром самостоятельно, чтобы согласовать все детали напрямую? При обращении можно сказать, что контакт вам дали в фонде 'РЭЙ'.";
    } else if (volunteerCount > 2) {
      volunteerMessage = "Пожалуйста, свяжитесь с одним из волонтёров напрямую. При обращении можно сказать, что контакт вам дали в фонде 'РЭЙ'.";
    }

    return `${username}, добрый день!

Благодарим вас за неравнодушие к бездомным животным и обращение в наш фонд!

Перечисленные вами вещи с радостью примут в приютах!

Мы будем вам очень признательны, если вы сможете передать их в один из пунктов сбора помощи, расположенных в следующих местах:

${letterBody}
${volunteerMessage}

Если передать помощь не получится по какой-либо причине, пожалуйста, напишите нам снова.

Спасибо!`;
  };

  const handleCopy = () => {
    const text = letterRef.current?.textContent;
    if (!text) return;

    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      const successful = document.execCommand("copy");
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Не удалось скопировать", err);
    }
    document.body.removeChild(textarea);
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайшего пункта сбора</h2>

      <input
        type="text"
        placeholder="Введите станцию метро (например, Октябрьское поле)"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Введите ваше имя"
        className="p-2 mb-4 border border-gray-300 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={handleSearch} className="p-2 bg-blue-500 text-white rounded">
        Найти пункт
      </button>

      {loading ? (
        <div className="mt-4 p-2 text-gray-500">Загрузка...</div>
      ) : result ? (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">Ближайшие пункты:</p>
          <ul>
            {result.nearestPoints.map((point, index) => (
              <li key={index}>{point.name} — {point.distance} км</li>
            ))}
          </ul>

          <div className="mt-4 p-2 bg-gray-100 rounded">
            <p className="font-bold">✉️ Сгенерированное письмо:</p>
            <pre ref={letterRef} className="bg-white p-4 border rounded text-sm whitespace-pre-wrap">{generateLetter()}</pre>
            <button
              onClick={handleCopy}
              className="mt-2 p-2 bg-green-500 text-white rounded"
            >
              {copied ? "✅ Скопировано" : "📋 Копировать письмо"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NearestPickupPoint;
