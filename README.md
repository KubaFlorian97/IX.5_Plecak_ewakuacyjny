# Projekt PLECAK EWAKUACYJNY

## Start

Pobrać projekt z GitHuba swoim ulubionym narzędziem Git.

Pobrać submoduły, można zrobić to poleceniem

```sh
git submodule update --init --recursive
```

Zainstalować zależności

```sh
npm install
```

## Dokumentacja

[packages/zpe-port/README.md](https://github.com/zpe-projekty/zpe-port/README.md)

## NPM

```sh
npm run build
```

Budowa gotowego kodu który można wysłać na platformę

```sh
npm run dev
```

Uruchomienie kodu w emulatorze. W tym trybie stan aplikacji zostanie załadowany zawsze z pliku "data/savedata.json".

```sh
npm run dev -- --env engine="engine-data.json"
```

Załadowanie alternatywnego pliku "engine.json" z folderu "data".

```sh
npm run dev -- --env savedata="other_savedata.json"
```

Załadowanie alternatywnego zapisu stanu - domyślny plik stanu jest w "data/savedata.json"
