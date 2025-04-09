const mongoose = require('mongoose')

const connectDb = async () => {
    if(process.env.MODE === "development") {
        await mongoose.connect(process.env.LOCAL_DB)
            .then(res => {
                console.log(`local mongodb connected`)
            })
            .catch(err => console.log(err.message))
    } else if (process.env.MODE === "production") {
        await mongoose.connect(process.env.CLOUD_DB)
            .then(res => {
                console.log(`cloud mongodb connected`)
            })
            .catch(err => console.log(err.message))
    }
}

module.exports = connectDb