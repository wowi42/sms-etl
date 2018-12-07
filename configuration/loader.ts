
const enum LoaderTypes {
    CSV = 'csv-loader',
    SQL = 'sql-loader',
    HTTP = 'http-loader',
    EXTRATOR = 'data-extrator-loader',
}

class ConfigurationLoader {

    // private loader:;

    constructor(type:LoaderTypes) {
        switch (type) {
            case LoaderTypes.CSV:
                return '';
            case LoaderTypes.SQL:
                return '';
            case LoaderTypes.EXTRATOR:
                return '';
            case LoaderTypes.HTTP:
                return '';
            default:
                console.log('[CONFIG_LOADER]', 'Loader is unknown');
                throw new Error('Unknown loader');
        }
    }

    sqlLoader() {
        //
    }

    csvLoader() {
        //
    }

    httpLoader() {
        //
    }

}
