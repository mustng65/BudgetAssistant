class ExtendedDate extends Date {

    /**
    * Gets the just the Date part of the ISO string
    *
    * @returns {string} Date in the format yyyy-MM-dd
    */
    toISODate() {
        return this.toISOString().split('T')[0];
    }
}