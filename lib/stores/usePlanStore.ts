import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Plan, mockPlans } from '@/lib/mock-plans';

interface PlanState {
  plans: Plan[];
  loading: boolean;
  userPlans: Plan[]; // 用户创建的计划
  
  // Actions
  initializePlans: () => void;
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => Plan | undefined;
  refreshPlans: () => void;
  clearUserData: () => void; // 清除用户数据的方法
}



export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      loading: false,
      userPlans: [],

      initializePlans: () => {
        const { userPlans } = get();
        // 确保从localStorage恢复的数据中的日期字段是Date对象
        const processedUserPlans = userPlans.map(plan => ({
          ...plan,
          startDate: plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate),
          targetDate: plan.targetDate instanceof Date ? plan.targetDate : new Date(plan.targetDate),
          createdAt: plan.createdAt instanceof Date ? plan.createdAt : new Date(plan.createdAt),
          updatedAt: plan.updatedAt instanceof Date ? plan.updatedAt : new Date(plan.updatedAt),
        }));
        
        // 合并用户计划和模拟数据，用户计划优先显示
        const allPlans = [...processedUserPlans, ...mockPlans];
        set({ plans: allPlans, userPlans: processedUserPlans, loading: false });
      },

      addPlan: (plan: Plan) => {
        set(state => {
          const newUserPlans = [plan, ...state.userPlans];
          const newAllPlans = [plan, ...state.plans.filter(p => !state.userPlans.find(up => up.id === p.id)), ...mockPlans];
          return {
            userPlans: newUserPlans,
            plans: newAllPlans
          };
        });
      },

      updatePlan: (id: string, updates: Partial<Plan>) => {
        set(state => {
          const updatedUserPlans = state.userPlans.map(plan => 
            plan.id === id ? { ...plan, ...updates } : plan
          );
          
          const updatedAllPlans = state.plans.map(plan => 
            plan.id === id ? { ...plan, ...updates } : plan
          );
          
          return {
            userPlans: updatedUserPlans,
            plans: updatedAllPlans
          };
        });
      },

      deletePlan: (id: string) => {
        set(state => {
          const filteredUserPlans = state.userPlans.filter(plan => plan.id !== id);
          const filteredAllPlans = state.plans.filter(plan => plan.id !== id);
          
          return {
            userPlans: filteredUserPlans,
            plans: filteredAllPlans
          };
        });
      },

      getPlanById: (id: string) => {
        const { plans } = get();
        return plans.find(plan => plan.id === id);
      },

      refreshPlans: () => {
        const { userPlans } = get();
        // 保持用户数据，只刷新模拟数据
        const allPlans = [...userPlans, ...mockPlans];
        set({ plans: allPlans });
      },

      clearUserData: () => {
        set({ userPlans: [], plans: [...mockPlans] });
      }
    }),
    {
      name: 'curio-plans-storage',
      storage: createJSONStorage(() => localStorage),
      // 只持久化用户创建的计划
      partialize: (state) => ({
        userPlans: state.userPlans
      }),
    }
  )
); 