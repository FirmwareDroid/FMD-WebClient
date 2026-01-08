// typescript
// File: `src/services/adb-streamer/auth/user-service.ts`
import { apiClient } from "../http-client";
import * as qs from "qs";

export class UserService {
    private readonly endpoint = "users";

    me() { return apiClient.get(`/${this.endpoint}/me`); }
    login(payload: unknown) { return apiClient.post(`/${this.endpoint}/login`, payload); }
    logout() { return apiClient.post(`/${this.endpoint}/logout`); }
    register(payload: unknown) { return apiClient.post(`/${this.endpoint}/register`, payload); }
    get(id: string) { return apiClient.get(`/${this.endpoint}/get/${id}`); }
    getAll(params: Record<string, any> = {}) {
        const q = qs.stringify(params, { encode: false });
        return apiClient.get(`/${this.endpoint}/get-all?${q}`);
    }
    update(id: string, payload: unknown) { return apiClient.patch(`/${this.endpoint}/update/${id}`, payload); }
    delete(id: string) { return apiClient.delete(`/${this.endpoint}/delete/${id}`); }
}

export const userService = new UserService();
