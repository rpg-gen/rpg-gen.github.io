export default function SubmitButton({children}) {

    // function handle_click (event) {
    //     event.preventDefault();
    //     if (onClick != null) {
    //         onClick(event);
    //     }
    // }

    return (
        <button type="submit" value="submit">{children}</button>
    );
};