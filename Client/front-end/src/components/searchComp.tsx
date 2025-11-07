import Image from "next/image"; 
import { useState } from "react";
import { useEffect } from "react";
import { useDebounce } from "use-debounce";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import api from "@/lib/axios";
import { User } from "./hooks/authProvider";
import toast from "react-hot-toast";

export default function SearchCompo( { search }: { search: boolean }){
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace } = useRouter();
    const [searchItems, setSearchItems] = useState(searchParams.get('query') || '');
    const [results, setResults] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debounceSearch] = useDebounce(searchItems, 500) ;
    async function handleClickedRequestFriendShip(friendId: number, action: string) {
        try {
          if (action === "INVITE") {
            await api.post("/friends/Invite", { friendId });
            toast.success("Friend request sent ✅");
            setResults(prev =>
              prev.map(user =>
                user.id === friendId ? { ...user, friendstatus: "pending" } : user
              )
            );
          } else if (action === "REMOVE") {
            await api.post("/friends/Remove", { friendId });
            toast("Friend removed 🗑️", { icon: "👋" });
            setResults(prev =>
              prev.map(user =>
                user.id === friendId ? { ...user, friendstatus: "none" } : user
              )
            );
          }else if (action == "ACCEPT"){
            await api.post("/friends/Accept", { friendId });
            toast.success("Friend request accepted 🤝");
            setResults(prev =>
              prev.map(user =>
                user.id === friendId ? { ...user, friendstatus: "accepted" } : user
              )
            );
          }
        } catch (err : any) {
          console.error("Error updating friend status:", err);
          const message = err || "Something went wrong ❌";
          toast.error(message);
        }
      }
    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (debounceSearch) {
          params.set("query", debounceSearch);
        } else {
          params.delete("query");
        }
        replace(`${pathname}?${params.toString()}`);
      }, [debounceSearch, searchParams, pathname, replace]);

      useEffect(() => {
        if (!debounceSearch) {
          setResults([]);
          return;
        }
        const controller = new AbortController();
        setIsLoading(true);
        api
        .get(`/search?query=${debounceSearch}`, { signal: controller.signal })
        .then((res) => {
            setResults(res.data.result);
        })
        .catch((err) => {
          if (err.name !== "CanceledError") {
            toast.error("Failed to search users ❌");
            console.error("Axios search error:", err);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
      return () => controller.abort();
      }, [debounceSearch]);

    return (
      <>
          <input
            type="search"
            onChange={(e) => setSearchItems(e.target.value)}
            placeholder="Search"
            value={searchItems}
            className="px-4  md:px-6 py-2 rounded-4xl focus:outline-none focus:ring-1
              focus:ring-white border-none
              bg-white-smoke/10 backdrop-blur-lg
              brightness-150  text-md font-bold
              w-full sm:h-full md:text-xl"
            autoFocus
          />

          {search && debounceSearch && (
            <div
              className="
                z-10 absolute top-full mt-3 
                w-fit md:w-fit lg:w-full
                bg-white-smoke/30 rounded-xl backdrop-blur-sm p-3
              "
            >
              {isLoading && <p className="text-white">Loading...</p>}
              {!isLoading && results.length === 0 && (
                <p className="text-white">No results found</p>
              )}

              <ul className="w-full">
                {results.map((item: User, index) => (
                  <li
                    key={index}
                    className="z-10 w-full text-black py-1 
                    px-2 gap-2 font-medium justify-between 
                    flex items-center
                   hover:bg-blue-purple/20 rounded-md"
                  >
                    <div className="flex gap-3 items-center">
                      <Image
                        src={item.avatar ?? "/images/defaultAvatar.jpg"}
                        alt={`${item.username} avatar`}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                      <span className="text-black-nave font-medium truncate max-w-[200px]">
                        {item.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.friendstatus === "none" && (
                        <button
                          onClick={() =>
                            handleClickedRequestFriendShip(item.id, "INVITE")
                          }
                          className="w-[90px] px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 active:bg-green-950 transition"
                        >
                          INVITE
                        </button>
                      )}

                      {item.friendstatus === "pending" && (
                        <button
                          onClick={() =>
                            handleClickedRequestFriendShip(item.id, "REMOVE")
                          }
                          className="w-[90px] px-3 py-1 rounded text-white bg-red-500 hover:bg-red-600 active:bg-red-950 transition"
                        >
                          REMOVE
                        </button>
                      )}

                      {item.friendstatus === "incoming" && (
                        <>
                          <button
                            onClick={() =>
                              handleClickedRequestFriendShip(item.id, "ACCEPT")
                            }
                            className="w-[90px] px-3 py-1 rounded text-white bg-green-500 hover:bg-green-600 active:bg-green-950 transition"
                            >
                            ACCEPT
                          </button>
                          <button
                          onClick={() =>
                            handleClickedRequestFriendShip(item.id, "REMOVE")
                          }
                          className="w-[90px] px-3 py-1 rounded text-white bg-  bg-red-500 hover:bg-red-600 active:bg-green-950 transition"
                          >
                            REMOVE
                        </button>
                      </>
                      )}
                      {item.friendstatus === "accepted" && null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
    )
}