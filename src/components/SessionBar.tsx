import "../assets/styles/sessionBar.css"

export default function SessionBar() {

    // THIS NEED A CONTEXT
    // CONTEXT CONTAINS:
    //  - LOGGED USER DATA
    //  - NOTIFICATIONS DATA
    // 

    return (
        <>
        
            <header className="sessionBar">
                ¡This is the session bar!

                <span className="sessionBarItem">Notifications</span>
                <span className="sessionBarItem">Profile</span>
                
            </header>

        </>
    )

}