import { AdminGuard } from "./admin.guard";

describe ('AdminGuard', () => {
    let guard: AdminGuard;
    beforeEach(() => {
        guard = new AdminGuard();
    })

    it('should allow an admin', () => {
        const fakeContext = {
            switchToHttp: () => ({
                getRequest: () => ({
                    user: { role: 'ADMIN'},
                })
            })
        }
        const result = guard.canActivate(fakeContext as any)
        expect (result).toBe(true);
    })
    it('should block a student', () => {
        const fakeContext = {
            switchToHttp: () => ({
                getRequest: ()=> ({
                    user: { role: 'STUDENT'},
                })
            })
        }
        expect (() => guard.canActivate(fakeContext as any)).toThrow('Admin access required');
    })
    it('should block a request with no user', ()=>{
        const fakeContext = {
            switchToHttp: () => ({
                getRequest:() => ({

                })
            })
        }
        expect (() => guard.canActivate(fakeContext as any)).toThrow('Admin access required');
    })
})