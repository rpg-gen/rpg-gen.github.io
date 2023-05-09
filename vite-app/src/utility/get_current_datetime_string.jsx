export default function get_current_datetime_string() {
    const current_date = new Date();
    const date_parts = [
        current_date.getFullYear(),
        make_two_digits(current_date.getMonth() + 1),
        make_two_digits(current_date.getDate()),
        make_two_digits(current_date.getHours()),
        make_two_digits(current_date.getMinutes()),
        make_two_digits(current_date.getSeconds()),
        make_three_digits(current_date.getMilliseconds()),
    ];

    return date_parts.join("_");
}

function make_two_digits(value) {
    return ("0" + value).slice(-2);
}

function make_three_digits(value) {
    return ("00" + value).slice(-3);
}