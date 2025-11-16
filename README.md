<!-- PROJECT LOGO -->
<br />
<p align="center">
  <!-- <img src="src/preview.jpg" width=200> -->
  <h3 align="center">ИИ-ассистент для работы с эмоциональным выгоранием</h3>
</p>

<p align="center">
  <a href=""><b>Алексей Спиркин</b></a> •
  <a href=""><b>Виктор Порошков</b></a> •
  <a href=""><b>Роман Томилов</b></a> •
  <br />
  <a href=""><b>Яна Дементьева</b></a> •
  <a href=""><b>Арсений Семенов</b></a>
  <br />
  Институт интеллектуальной робототехники
  <br />
  Новосибирский государственный университет
</p>

## О проекте

ИИ-ассистент, позволяющий проводить мониторинг эмоционального состояния сотрудников:

* Тестирование сотрудников по методике MBI
* Выполнение еженедельных заданий в геймифицированном формате
* Получение персональных рекомендаций
* Мониторинг состояния сотрудников для HR

## Установка и запуск (вручную)

1. Склонируйте репозиторий.

```
git clone https://git.truetecharena.ru/sistema-xak-novosibirsk-22/truetecharena1763103693-team-19929/repozitorij-dlya-raboty-334.git
cd repozitorij-dlya-raboty-334
```

### Frontend

2. Перейдите в папку с файлами серверной части и установите зависимости.

```
cd server
npm install
```

3. Запустите проект.

```
npm run dev
```

### Backend

2. Перейдите в папку с файлами серверной части и установите зависимости.

```
cd server
npm install
```

3. Инициализируйте БД и загрузите в нее стартовые значения.

```
npm run init-db
npm run migrate
```

4. Запустите проект.

```
npm run dev
```

## Установка и запуск (Docker)

1. Склонируйте репозиторий.

```
git clone https://git.truetecharena.ru/sistema-xak-novosibirsk-22/truetecharena1763103693-team-19929/repozitorij-dlya-raboty-334.git
cd repozitorij-dlya-raboty-334
```

2. Укажите все необходимые параметры в файле `docker-compose.yml`.
3. Запустите `docker compose`.

```
docker compose up -d
```
