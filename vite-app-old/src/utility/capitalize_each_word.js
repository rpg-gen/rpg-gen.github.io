export default function capitalize_each_word(str) {

    if (str == null || str == undefined) {
        return str;
    }

    str = str.split(" ");

    for (var i = 0, x = str.length; i < x; i++) {
        if (str[i].length > 0 && !["of", "a"].includes(str[i])) {
            str[i] = str[i][0].toUpperCase() + str[i].substr(1);
        }
    }

    return str.join(" ");
}