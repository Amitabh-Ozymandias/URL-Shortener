class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    search() {
        if (this.queryString.search) {

            const keyword = this.queryString.search.trim();

            this.query = this.query.find({
                $or: [
                    {
                        alias: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        originalUrl: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }
                ]
            });

        }

        return this;
    }

    filter() {

        if (this.queryString.status) {

            switch (this.queryString.status.toLowerCase()) {

                case "active":

                    this.query = this.query.find({
                        active: true
                    });

                    break;

                case "inactive":

                    this.query = this.query.find({
                        active: false
                    });

                    break;

            }

        }

        return this;
    }

    sort() {

        const sortBy = this.queryString.sort || "createdAt";

        const order =
            this.queryString.order === "asc"
                ? 1
                : -1;

        this.query = this.query.sort({
            [sortBy]: order
        });

        return this;
    }

    paginate() {

        const page =
            Number(this.queryString.page) || 1;

        const limit =
            Number(this.queryString.limit) || 10;

        const skip = (page - 1) * limit;

        this.page = page;
        this.limit = limit;

        this.query = this.query
            .skip(skip)
            .limit(limit);

        return this;
    }

}

module.exports = APIFeatures;