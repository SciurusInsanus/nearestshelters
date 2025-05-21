import React, { useState } from "react";

const shelters = [
  { name: "Бескудниково", address: "ул. Дубнинская, д.83а, стр.25", coords: [55.894495, 37.551807], phone: "89260413651", volunteer: "Анна", district: "Восточное Дегунино" },
  { name: "Бирюлево", address: "Востряковский пр-д, вл. 10А", coords: [55.581134, 37.616512], phone: "89163115095", volunteer: "Юлия", district: "Бирюлево" },
  { name: "Бирюлево_2", address: "Востряковский пр-д, вл. 10А", coords: [55.581134, 37.616512], phone: "89262113585", volunteer: "Анастасия", district: "Бирюлево" },
  { name: "ДвориКо", address: "Московская обл., Люберецкий р-он, д. Марусино, снт Пехорка-1, уч. 113", coords: [55.696590, 37.966972], phone: "89266029808", volunteer: "Ирина", district: "Некрасовка" },
  { name: "Дубовая роща", address: "проезд Дубовой Рощи, вл23-25", coords: [55.817603, 37.605283], phone: "89169798613", volunteer: "Елена", district: "Дубовая роща" },
  { name: "Зов Предков", address: "Московская обл., Одинцовский р-н, раб. пос. Большие Вязёмы, Западный проезд, вл.1", coords: [55.631488, 36.975690], phone: "89262209682", volunteer: "Елена", district: "Одинцовский, пос. Большие Вязёмы" },
  { name: "Зоорассвет", address: "Рассветная аллея, д. 10", coords: [55.739737, 37.798277], phone: "89168147549", volunteer: "Ирина", district: "Новогиреево" },
  { name: "Кошачья надежда", address: "Московская обл., г. Звенигород, Ратехинское шоссе, д.8", coords: [55.731319, 36.814603], phone: "89261340815", volunteer: "Елена", district: "г. Звенигород" },
  { name: "Красная сосна", address: "ул. Красная Сосна д. 30 стр.4", coords: [55.842686, 37.679942], phone: "89856880063", volunteer: "Екатерина", district: "Свиблово" },
  { name: "Лапушка", address: "Московская обл., г. Балашиха, дер. Павлино, ул.Румянцевская, д.1а", coords: [55.723552, 37.954009], phone: "89055254204", volunteer: "Елена", district: "Павлино" },
  { name: "Машкинский", address: "Москва, Машкинское шоссе, 2А", coords: [55.913505, 37.387846], phone: "89165647839", volunteer: "Татьяна", district: "Новокуркино" },
  { name: "Некрасовка", address: "ул. 2-я Вольская, д. 17а, стр. 3", coords: [55.690248, 37.932441], phone: "89167820607", volunteer: "Артемий", district: "Некрасовка" },
];

const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
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

const NearestShelters = () => {
  const [station, setStation] = useState("");
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cantDeliver, setCantDeliver] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isMinorVolunteer, setIsMinorVolunteer] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const stationCoords = await fetchCoords(station);
      const distances = shelters.map((shelter) => ({
        ...shelter,
        distance: haversineDistance(stationCoords, shelter.coords),
      }));

      const sorted = distances.sort((a, b) => a.distance - b.distance);
      const nearest = sorted[0].distance > 10
        ? sorted.slice(0, 2).map((shelter) => ({ ...shelter, distance: shelter.distance.toFixed(2) }))
        : [{ ...sorted[0], distance: sorted[0].distance.toFixed(2) }];

      setResult({ nearest, stationCoords });
    } catch (e) {
      alert("Ошибка при геокодировании станции.");
    }
    setLoading(false);
  };

  const adjustShelterForVolunteer = (shelter) => {
    if (
      (isVolunteer || isMinorVolunteer) &&
      shelter.name === "Бирюлево"
    ) {
      return shelters.find((s) => s.name === "Бирюлево_2") || shelter;
    }
    return shelter;
  };

  const generateLetter = () => {
    if (!result) return "";
    const { nearest } = result;
    const shelter = adjustShelterForVolunteer(nearest[0]);

    if (isVolunteer || isMinorVolunteer) {
      return `${username}, добрый день!

Благодарим вас за желание помогать животным вместе с нами и обращение в наш фонд!

Ближайший к вам приют, где возможен уход за животными, находится в районе ${shelter.district}. Там всегда рады волонтерам. Очень нужна помощь в социализации, общении, кормлении и выгуле животных, в поиске дома и хозяев для них.

Контакт волонтера, с которым можно будет обсудить детали поездки в приют: ${shelter.phone}, ${shelter.volunteer}. Когда будете звонить, можно сказать, что контакт дали в фонде «РЭЙ».

${
  isMinorVolunteer
    ? "Обращаем ваше внимание, что несовершеннолетних пускают в приют только в сопровождении кого-то из родителей в целях безопасности, а животных выдают на прогулки только людям старше 18 лет.\n\n"
    : ""
}Если по какой-то причине данный приют не подойдет, пожалуйста, сообщите нам, мы постараемся подобрать для вас другой.

Спасибо!`;
    }

    if (cantDeliver) {
      return `${username}, здравствуйте!

Благодарим вас за желание помочь животным и обращение в наш фонд!

Перечисленные вами вещи могли бы пригодиться в приютах, но, к сожалению, у волонтеров не хватает ресурсов, чтобы организовать вывоз подобной помощи.
Может быть, вы найдете возможность самостоятельно доставить то, что отдаете, в ближайший к вам приют, расположенный в районе ${shelter.district}? Возможно, кто-то из ваших родственников или знакомых сможет вам помочь в этом?

Контакт волонтера приюта, с которым можно будет обсудить передачу помощи: ${shelter.phone}, ${shelter.volunteer}.
Не затруднит ли вас связаться с волонтером самостоятельно, чтобы согласовать все детали напрямую? Когда будете звонить, можно сказать, что контакт дали в фонде «РЭЙ».

Если передать помощь не получится по какой-либо причине, пожалуйста, напишите нам снова.

Спасибо!`;
    }

    return `${username}, добрый день!

Благодарим вас за неравнодушие к бездомным животным и обращение в наш фонд!

Перечисленные вами вещи в хорошем состоянии (без значительных повреждений и загрязнений), а также корм с неистекшим сроком годности с радостью примут в приютах.

Приют, куда вы можете передать помощь, находится в районе ${shelter.district}. 
Контакт волонтера приюта, с которым можно будет обсудить передачу помощи: ${shelter.phone}, ${shelter.volunteer}.
Не затруднит ли вас связаться с волонтером самостоятельно, чтобы согласовать все детали напрямую? Когда будете звонить, можно сказать, что контакт дали в фонде «РЭЙ».

Если передать помощь не получится по какой-либо причине, пожалуйста, напишите нам снова.

Спасибо!`;
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white shadow rounded-xl">
      <h2 className="text-xl font-bold mb-4">Поиск ближайших приютов</h2>

      <input
        type="text"
        placeholder="Введите станцию метро"
        className="p-2 mb-2 border border-gray-300 rounded w-full"
        value={station}
        onChange={(e) => setStation(e.target.value)}
      />
      <input
        type="text"
        placeholder="Введите ваше имя"
        className="p-2 mb-2 border border-gray-300 rounded w-full"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="block mb-2">
        <input
          type="checkbox"
          className="mr-2"
          checked={isVolunteer}
          onChange={() => setIsVolunteer(!isVolunteer)}
        />
        Это волонтёр
      </label>

      <label className="block mb-2">
        <input
          type="checkbox"
          className="mr-2"
          checked={isMinorVolunteer}
          onChange={() => setIsMinorVolunteer(!isMinorVolunteer)}
        />
        Это несовершеннолетний волонтёр
      </label>

      <label className="block mb-4">
        <input
          type="checkbox"
          className="mr-2"
          checked={cantDeliver}
          onChange={() => setCantDeliver(!cantDeliver)}
        />
        Не может сам везти
      </label>

      <button
        onClick={handleSearch}
        className="p-2 bg-green-500 text-white rounded"
      >
        Найти приюты
      </button>

      {loading ? (
        <div className="mt-4 p-2 text-gray-500">Загрузка...</div>
      ) : result ? (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p className="font-bold">Ближайшие приюты:</p>
          <ul>
            {result.nearest.map((shelter, index) => (
              <li key={index}>
                {shelter.name} — {shelter.distance} км
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <p className="font-bold">✉️ Сгенерированное письмо:</p>
            <pre className="bg-white p-4 border rounded text-sm whitespace-pre-wrap">
              {generateLetter()}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NearestShelters;
