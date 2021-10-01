const state = {
    lists: [
        {
            name: 'Продукты',
            listId: '1',
            color: 'orange',
            updated: false,
            items: [
                {id: '1', name: 'хлеб', bought: false},
                {id: '2', name: 'колбаса', bought: true},
                {id: '3', name: 'молоко', bought: false},
                {id: '4', name: 'сыр', bought: false},
                {id: '5', name: 'пельмени', bought: false},
                {id: '6', name: 'чебуреки', bought: false},
                {id: '7', name: 'печенье', bought: false},
                {id: '8', name: 'кефир', bought: false},
            ]
        },
        {
            name: 'Аптека',
            listId: '2',
            color: 'green',
            updated: false,
            items: []
        }, 
        {
            name: 'Хозтовары',
            listId: '3',
            color: 'blue',
            updated: false,
            items: [
                {id: '1', name: 'мыло', bought: false},
                {id: '2', name: 'шампунь', bought: true},
                {id: '3', name: 'зубная паста', bought: false},
            ]
        }, 
    ],

    listColors: ['orange', 'green', 'blue', 'purple', 'red', 'yellow'],

    options: {
        darkTheme: false
    },

    findListIndex(listId) {
        return this.lists.findIndex(list => list.listId === listId);
    },

    deleteCrossedInList(listId) {
        let listIndex = this.findListIndex(listId);
        this.lists[listIndex].items = this.lists[listIndex].items.filter(item => !item.bought);
    },

    deleteAllInList(listId) {
        let listIndex = this.findListIndex(listId);
        this.lists[listIndex].items = [];
    },

    writeToLocalStorage() {
        localStorage.setItem('lists', JSON.stringify(state.lists));
        localStorage.setItem('options', JSON.stringify(state.options));
    },

    readFromLocalStorage() {
        if (localStorage.getItem('lists')) {
            const lists = JSON.parse(localStorage.getItem('lists'));
            state.lists = [...lists];
        }
        if (localStorage.getItem('options')) {
            const options = JSON.parse(localStorage.getItem('options'));
            state.options = {...options};
        }
    }
};