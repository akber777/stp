class Gulp {
    constructor(name) {
        return this.name = name;
    }

    static gulp = () => {

        return 'GULP';
    }

}

Gulp.gulp()



let info = {
    name: 'Akber',
    lastName: 'Akhmedzadeh',
    age: '23'
}


let split = [{ ...info }].map(item => {

    console.log(item)

})

// gulpOptions sperated operator olmadan map olunmuyacaqdi sepereted opereator vasitesiyle biz rahatliqla json objecti map ede bileriy ve yaxudda {gulpOptions} bele

// butun jsler babel vasitesiyle convert edilir

// bu dosya ve bu dosyada yazilan butun jsler test ucundur js dosyasinda olan butun elementleri sile biler ozunuz istedyiniz yeni js fayllarini yarada bilersiniz