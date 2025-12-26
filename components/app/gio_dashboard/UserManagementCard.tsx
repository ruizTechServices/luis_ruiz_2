export default function UserManagementCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow cursor-pointer">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Management/missing</h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Manage users, roles, and permissions</p>
      <div className="flex -space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
      </div>
    </div>
  );
}
/*//*This component must be able to have server side rendering access with an api, or otherwise. 
This is a component that enables the frontend admin to control users, roles, and permissions. This 
component must be extremely modualar and have the ability to be extended with server side components. . */