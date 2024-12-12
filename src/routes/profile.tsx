import { useAuthContext } from "../contexts/AuthContext"
export default function Profile() {

    const {user, updateUser } = useAuthContext();

    const handleUpdate = () => {
        if (user != null) {
            updateUser({
                name: "Pedro",
                lastname: "$",
                email: null,
                password: null,
                role: null
            })
        }
    }

    return (
        <>
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-semibold text-center mb-6">Profile Page</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* User Details */}
                    <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">User Information</h2>
                        <div className="flex flex-col space-y-2">
                            <p><span className="font-semibold">Name:</span> {user?.name} {user?.lastname}</p>
                            <p><span className="font-semibold">Email:</span> {user?.email || "Not provided"}</p>
                            <p><span className="font-semibold">Role:</span> {user?.role}</p>
                        </div>
                    </div>

                    {/* Update Profile Section */}
                    <div className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center">
                        <h2 className="text-2xl font-semibold mb-4">Update Your Profile</h2>
                        <p className="text-gray-600 mb-6">Want to update your information? Click the button below to
                            update your profile.</p>
                        <button
                            className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200"
                            onClick={handleUpdate}
                        >
                            Update Profile
                        </button>
                    </div>
                </div>
            </div>
        </>
    )

}