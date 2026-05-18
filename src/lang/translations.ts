export type Language = 'pl' | 'en';

export const translations = {
    pl: {
        topbar: {
            help_btn: "Pomoc",
            settings_btn: "Ustawienia",
            fullscreen_btn: "Pełny ekran",
            sound_mute_btn: "Przycisk wyciszenia dźwięków",
            menu_btn: "Menu"
        },
        help: {
            title: "INSTRUKCJA",
            sec_controls: "STEROWANIE",
            list_controls: {
                mouse: { control: "MYSZKA/DOTYK", desc: "Przeciągnij ekran, aby rozglądać się po pomieszczeniu." },
                click: { control: "KLIKNIĘCIE", desc: "Interakcje z przedmiotami, otwieranie szafek i szuflad." },
                tab: { control: "TAB", desc: "Nawigacja klawiaturą." },
                enter: { control: "ENTER/SPACJA", desc: "Interakcja z przedmiotami, otwieranie szafek i szuflad, przesuwanie przedmiotów (tryb dostępności)." }
            },
            sec_hotkey: "SKRÓTY KLAWISZOWE",
            list_hotkey: {
                help: { control: "H", desc: "Otwórz/zamknij instrukcję" },
                settings: { control: "S", desc: "Otwórz/zamknij ustawienia" },
                fullscreen: { control: "F", desc: "Przełącz tryb pełnego ekranu" },
                inventory: { control: "I", desc: "Otwórz/zamknij listę kontrolną" }
            },
            sec_how_to_play: "JAK GRAĆ?",
            txt_how_to_play: "Gra polega na odkrywaniu przedmiotów porozrzucanych po pomieszczeniach w mieszkaniu. Przedmioty mogą znajdować się na widoku oraz być ukryte w szafkach, szufladach lub za innymi przedmiotami. Twoim zadaniem jest zebranie wszystkich potrzebnych przedmiotów podczas zagrożenia przed upływem czasu na ewakuację.",
            sec_accessability: "UŁATWIENIA DOSTĘPNOŚCI",
            list_accessability: [
                "Aby skorzystać z ułatwień dostępności należy kliknąć przycisk ustawień (z zębatką), który znajduje się w prawym górnym rogu ekranu.",
                "Możesz skorzystać z poniższych ułatwień: tryb wysokiego kontrastu, powiększenie tekstu, filtra kolorów oraz zmiana wielkości i koloru kursora.",
                "Głośność muzyki i dźwięków można dostosować za pomocą suwaków dostępnych po kliknięciu przycisku ustawień lub wyciszyć za pomocą przycisku górnym pasku."
            ],
            sec_sounds: "MUZYKA I DŹWIĘKI",
            txt_sounds: "Możliwość wyciszenia lub zmiany głośności muzyki i efektów dźwiękowych jest dostępna po kliknięciu przycisku ustawień (z zębatką), który znajduje się w prawym górnym rogu ekranu. Możliwe jest również wyciszenie wszystkich dźwięków za pomocą przycisku znajdującego się na górnym pasku.",
            btn_close: "ZAMKNIJ"
        },
        intro: {
            title: "PLECAK EWAKUACYJNY",
            step1: "WYBIERZ ZAGROŻENIE",
            step2: "POZIOM TRUDNOŚCI",
            crisis_mode: "SCENARIUSZ KRYZYSOWY",
            crisis_desc: "Nie wiesz co Cię czeka...",
            custom_mode: "WŁASNY",
            custom_desc: "Skonfiguruj własne zasady",
            custom_settings: "USTAWIENIA GRY",
            cust_time: "Czas gry:",
            cust_dark: "Brak prądu (Ciemność):",
            btn_play: "GRAJ",
            btn_next: "DALEJ",
            btn_back: "WSTECZ",
            btn_start: "ROZPOCZNIJ",
            btn_start_game: "ROZPOCZNIJ NOWĄ GRĘ",
            mission_time: "CZAS NA UCIECZKĘ",
            mission_cond: "POZIOM TRUDNOŚCI",
            resume_title: "WITAJ W GRZE!",
            resume_text: "Wygląda na to, że masz już rozpoczętą rozgrywkę. Chcesz ją kontynuować czy wolisz zacząć od nowa?",
            welcome_text: "Witaj w symulatorze. Twoim zadaniem jest przygotowanie plecaka ewakuacyjnego.",
            btn_resume: "KONTYNUUJ",
            btn_new: "NOWA GRA",
            resume_intro: "Przed Tobą gra, w której Twoim głównym zadaniem jest szybkie i skuteczne skompletowanie plecaka ewakuacyjnego. Przeszukuj pomieszczenia, wybieraj niezbędne przedmioty i przygotuj się na sytuacje zagrożenia.",
            resume_task: "Zbierz wszystkie wymagane przedmioty z domu i wydostań się na zewnątrz, zanim będzie za późno!",
            resume_taskLbl: "TWOJE ZADANIE:"
        },
        inventory: {
            title: "LISTA KONTROLNA",
            items: "Przedmioty",
            btn_exit: "WYJŚCIE",
            btn_evacuate: "EWAKUUJ SIĘ",
            confirm_exit: "Czy na pewno chcesz przerwać grę?",
            drop_item: "Usuń przedmiot",
            close: "Zamknij"
        },
        summary: {
            title: "RAPORT KOŃCOWY",
            score: "Twój Wynik:",
            time_bonus: "Bonus za czas:",
            total: "RAZEM:",
            sec_good: "DOBRZE ZABRANE",
            sec_bad: "NIEPOTRZEBNE (Obciążenie)",
            sec_missed: "ZAPOMNIANE (Kluczowe)",
            btn_retry: "SPRÓBUJ PONOWNIE",
            reason: "Dlaczego: ",
            ideal_backpack: "Idealny Plecak",
            player_backpack: "Twój Plecak",
            empty_backpack: "Pusty Plecak"
        },
        settings: {
            title: "Ustawienia",
            hc_mode: "Tryb wysokiego kontrastu",
            text_size: "Wielkość tekstu",
            cursor_title: "KURSOR",
            cursor_size: "Rozmiar kursora",
            cursor_color: "Kolor kursora",
            cursor_normal: "Normalny",
            cursor_large: "Duży",
            section_audio: "MUZYKA I DŹWIĘKI",
            music_vol: "Muzyka",
            sfx_vol: "Dźwięki",
            mute: "Wycisz",
            text_100: "Normalny (100%)",
            text_150: "Duży (150%)",
            text_200: "Bardzo Duży (200%)",
            filter_title: "FILTR KOLORÓW",
            filter_none: "Brak",
            filter_grayscale: "Szarość",
            filter_sepia: "Sepia",
            filter_invert: "Odwrócenie",
            filter_protanopia: "Protanopia",
            filter_deuteranopia: "Deuteranopia",
            filter_tritanopia: "Tritanopia",
            filter_achromatopsia: "Monochrom.",
            btn_reset: "Resetuj"
        },
        game: {
            game_over_timeout: "CZAS MINĄŁ! Ewakuacja nieudana.",
            game_over_success: "Ewakuacja zakończona.",
            too_dark: "Zbyt ciemno! Bez latarki nie wejdziesz do tego pomieszczenia.",
            item_collected: "Zebrano:",
            item_dropped: "Odłożono:",
            container_opened: "Otwarto:",
            container_closed: "Zamknięto:",
            feedback_required: "Bardzo dobrze! To ważny przedmiot!",
            feedback_good: "Dobry wybór, to się zawsze przyda.",
            feedback_bad: "Ten przedmiot raczej się nie przyda..."
        },
        minimap: {
            label: "Minimapa"
        },
        room: {
            go_to: "Idź do",
            bedroom: "Sypialnia",
            wc: "Toaleta",
            kitchen: "Kuchnia",
            living_room: "Salon",
            bedroom_girl: "Sypialnia dziewczynki",
            bedroom_teen: "Sypialnia nastolatka",
            bathroom: "Łazienka"
        },
        threats: {
            flood: { name: "Powódź", desc: "Woda wdziera się do domu", alert: "Uwaga! Uwaga! Osoby znajdujące się na terenie dzielnic Zabłocie i Stare Podgórze w miejscowości Kraków, około godz. 14 min. 30 może nastąpić zagrożenie powodziowe w związku z wylaniem rzeki Wisła w kierunku południowym w stronę zabudowań mieszkalnych. Prosimy o zabranie ze sobą niezbędnych rzeczy i udanie się do punktu zbiórki na parkingu przy Terminalu Autobusowym \"Podgórze SKA\"." },
            fire: { name: "Pożar", desc: "Ogień w budynku", alert: "Uwaga! Uwaga! Osoby znajdujące się na terenie dzielnicy Ursynów w miejscowości Warszawa, około godz. 14 min. 30 może nastąpić zagrożenie pożarowe w kierunku północnym, w stronę zabudowań mieszkalnych. Prosimy o zabranie ze sobą niezbędnych rzeczy i udanie się do punktu zbiórki przy szkole podstawowej nr 310." },
            contamination: { name: "Skażenie", desc: "Wyciek chemikaliów", alert: "Uwaga! Uwaga! Osoby znajdujące się na terenie osiedla Skarpa w miejscowości Płock, około godz. 14 min. 30 może nastąpić zagrożenie związane ze skażeniem chemicznym w kierunku południowym, z powodu awarii w pobliskiej rafinerii. Prosimy o zabranie ze sobą niezbędnych rzeczy i udanie się do punktu zbiórki, który znajduje się przy Domu Studenta \"Wcześniak\"." },
            uxo: { name: "Niewybuch", desc: "Ewakuacja osiedla", alert: "Uwaga! Uwaga! Osoby znajdujące się na terenie osiedla Orła Białego w miejscowości Poznań, około godz. 14 min. 30 może nastąpić zagrożenie w związku z odnalezionym niewybuchem w okolicy zabudowań mieszkalnych. Prosimy o zabranie ze sobą niezbędnych rzeczy i udanie się do punktu zbiórki, który znajduje się przy przedszkolu nr 178." }
        },
        difficulty: {
            easy: "Łatwy",
            hard: "Trudny",
            extreme: "Bardzo Trudny",
            hardcore: "Hardcore",
            custom: "Niestandardowy"
        }
    },
    en: {
        topbar: {
            help_btn: "Help",
            settings_btn: "Settings",
            fullscreen_btn: "Fullscreen"
        },
        help: {
            title: "INSTRUCTIONS",
            sec_controls: "CONTROLS",
            list_controls: {
                mouse: { control: "MOUSE/TOUCH", desc: "Drag the screen to look around." },
                click: { control: "CLICK", desc: "Interact with objects, open cabinets and drawers, move items (accessibility mode)." },
                tab: { control: "TAB", desc: "Keyboard navigation." },
                enter: { control: "ENTER/SPACE", desc: "Interact with objects, open cabinets and drawers, move items (accessibility mode)." }
            },
            sec_hotkey: "HOTKEYS",
            list_hotkey: {
                help: { control: "H", desc: "Open/close manual" },
                settings: { control: "S", desc: "Open/close settings" },
                fullscreen: { control: "F", desc: "Toggle fullscreen mode" },
                inventory: { control: "I", desc: "Open/close check list" }
            },
            sec_how_to_play: "HOW TO PLAY?",
            txt_how_to_play: "The game is about discovering items scattered around the rooms of the apartment. Items may be visible or hidden inside cabinets, drawers, or behind other objects. Your task is to collect all the necessary items required in an emergency before the evacuation time runs out.",
            sec_accessability: "ACCESSIBILITY OPTIONS",
            list_accessability: [
                "To use accessibility options, click the settings button (gear icon) located in the top-right corner of the screen.",
                "Players with special needs can use the following options: \"High Contrast Mode\" and \"Large Text\"."
            ],
            sec_sounds: "MUSIC AND SOUNDS",
            txt_sounds: "You can mute or adjust the volume of music and sound effects by clicking the settings button (gear icon) located in the top-right corner of the screen.",
            btn_close: "CLOSE"
        },
        intro: {
            title: "EVACUATION BACKPACK",
            step1: "CHOOSE A THREAT",
            step2: "DIFFICULTY LEVEL",
            crisis_mode: "CRISIS SCENARIO",
            crisis_desc: "You never know what awaits you...",
            custom_mode: "CUSTOM",
            custom_desc: "Configure your own rules",
            custom_settings: "GAME SETTINGS",
            cust_time: "Game time:",
            cust_dark: "Power outage (Darkness):",
            btn_play: "PLAY",
            btn_next: "NEXT",
            btn_back: "BACK",
            btn_start: "START",
            btn_start_game: "START NEW GAME",
            mission_time: "TIME TO ESCAPE",
            mission_cond: "DIFFICULTY LEVEL",
            resume_title: "RESUME GAME",
            resume_text: "It looks like you already have a game in progress. Do you want to continue or start a new one?",
            welcome_text: "Welcome to the simulator. Your task is to prepare an evacuation backpack.",
            btn_resume: "RESUME",
            btn_new: "NEW GAME"
        },
        inventory: {
            title: "CHECK LIST",
            items: "Items",
            btn_exit: "EXIT",
            btn_evacuate: "EVACUATE",
            confirm_exit: "Are you sure you want to quit the game?",
            drop_item: "Drop item"
        },
        summary: {
            title: "FINAL REPORT",
            score: "Your Score:",
            time_bonus: "Time bonus:",
            total: "TOTAL:",
            sec_good: "CORRECT ITEMS",
            sec_bad: "UNNECESSARY (Weight)",
            sec_missed: "MISSED (Critical)",
            btn_retry: "TRY AGAIN",
            reason: "Why:",
            ideal_backpack: "Ideal Backpack",
            player_backpack: "Your Backpack",
            empty_backpack: "Empty Backpack"
        },
        settings: {
            title: "Settings",
            hc_mode: "High contrast mode",
            text_size: "Text size",
            section_audio: "MUSIC AND SOUNDS",
            music_vol: "Music",
            sfx_vol: "Sounds",
            mute: "Mute",
            text_100: "Normal (100%)",
            text_150: "Large (150%)",
            text_200: "Very Large (200%)",
            btn_reset: "Reset"
        },
        game: {
            game_over_timeout: "TIME'S UP! Evacuation failed.",
            game_over_success: "Evacuation completed.",
            too_dark: "Too dark! You can’t enter this room without a flashlight."
        },
        room: {
            go_to: "Go to:",
            bedroom: "Bedroom",
            wc: "Bathroom",
            kitchen: "Kitchen",
            living_room: "Living Room",
            bedroom_girl: "Girl's Bedroom",
            bedroom_teen: "Teen's Bedroom",
            corridor: "Corridor"
        },
        threats: {
            flood: {
                name: "Flood",
                desc: "Water is entering the house",
                alert: "Attention! Attention! Residents of the Zabłocie and Stare Podgórze districts in Kraków may face a flood threat around 2:30 PM due to the Vistula River overflowing southward toward residential areas. Please take essential belongings and proceed to the assembly point at the parking lot near the \"Podgórze SKA\" Bus Terminal."
            },
            fire: {
                name: "Fire",
                desc: "Fire in the building",
                alert: "Attention! Attention! Residents of the Ursynów district in Warsaw may face a fire threat around 2:30 PM spreading north toward residential areas. Please take essential belongings and proceed to the assembly point at Primary School No. 310."
            },
            contamination: {
                name: "Contamination",
                desc: "Chemical leak",
                alert: "Attention! Attention! Residents of the Skarpa housing estate in Płock may face a chemical contamination threat around 2:30 PM due to an аварia at a nearby refinery, spreading southward. Please take essential belongings and proceed to the assembly point located near the \"Wcześniak\" Student Dormitory."
            },
            uxo: {
                name: "Unexploded Ordnance",
                desc: "Neighborhood evacuation",
                alert: "Attention! Attention! Residents of the Orła Białego housing estate in Poznań may face a threat around 2:30 PM due to an unexploded ordnance found near residential buildings. Please take essential belongings and proceed to the assembly point located at Kindergarten No. 178."
            }
        },
        difficulty: {
            easy: "Easy",
            hard: "Hard",
            extreme: "Very Hard",
            hardcore: "Hardcore",
            custom: "Custom"
        }
    }
};