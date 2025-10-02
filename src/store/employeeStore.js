import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { listEmployees, 
        createEmployee, 
        getEmployee, 
        updateEmployee, 
        deleteEmployee } from '../services/EmployeeService';

// 직원(Employee) 상태 관리를 위한 Zustand 스토어 생성
const useEmployeeStore = create(devtools((set, get) => ({
    // ========== 상태(State) 영역 ==========
    
    // 전체 직원 목록을 저장하는 배열
    employees: [],
    // 현재 선택되거나 조회 중인 직원의 상세 정보
    currentEmployee: null,
    // API 호출 중인지 여부를 나타내는 로딩 상태
    loading: false,
    // 발생한 에러 정보를 저장 (에러 메시지 등)
    error: null,

    // ========== 액션(Actions) 영역 ==========
    
    // 로딩 상태를 직접 설정하는 액션
    setLoading: (loading) => set({ loading }),
    
    // 에러 정보를 직접 설정하는 액션
    setError: (error) => set({ error }),
    
    // 에러 정보를 초기화(null로 설정)하는 액션
    clearError: () => set({ error: null }),

    // 모든 직원 목록을 조회하는 비동기 액션
    fetchEmployees: async () => {
      // API 호출 전: 로딩 상태 true, 에러 초기화
      set({ loading: true, error: null });
      try {
        // EmployeeService를 통해 직원 목록 API 호출
        const response = await listEmployees();
        // 성공 시: 조회된 데이터로 employees 상태 업데이트, 로딩 종료
        set({ employees: response.data || [], loading: false });
      } catch (error) {
        // 실패 시: 에러 메시지 저장, 로딩 종료, 콘솔에 에러 로그 출력
        set({ error: error.message, loading: false });
        console.error('직원 목록 조회 중 오류 발생:', error);
      }
    },

    // 특정 ID를 가진 직원의 상세 정보를 조회하는 비동기 액션
    fetchEmployee: async (id) => {
      set({ loading: true, error: null });
      try {
        const response = await getEmployee(id);
        // 성공 시: 현재 직원 정보 저장, 로딩 종료
        set({ currentEmployee: response.data, loading: false });
        // 호출한 컴포넌트에서 사용할 수 있도록 데이터 반환
        return response.data;
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('직원 상세 정보 조회 중 오류 발생:', error);
        // 호출한 컴포넌트에서 에러를 처리할 수 있도록 에러 전파
        throw error;
      }
    },

    // 새로운 직원을 생성하는 비동기 액션
    createEmployee: async (employeeData) => {
      set({ loading: true, error: null });
      try {
        const response = await createEmployee(employeeData);
        const newEmployee = response.data;
        // 성공 시: 기존 직원 목록에 새 직원 추가, 로딩 종료
        set(state => ({
          employees: [...state.employees, newEmployee],
          loading: false
        }));
        return newEmployee;
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('직원 생성 중 오류 발생:', error);
        throw error;
      }
    },

    // 기존 직원 정보를 수정하는 비동기 액션
    updateEmployee: async (id, employeeData) => {
      set({ loading: true, error: null });
      try {
        const response = await updateEmployee(id, employeeData);
        const updatedEmployee = response.data;
        set(state => ({
          // 직원 목록에서 해당 ID의 직원 정보만 업데이트
          employees: state.employees.map(emp => 
            emp.id === parseInt(id) ? updatedEmployee : emp
          ),
          // 현재 조회 중인 직원 정보도 업데이트
          currentEmployee: updatedEmployee,
          loading: false
        }));
        return updatedEmployee;
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('직원 정보 수정 중 오류 발생:', error);
        throw error;
      }
    },

    // 직원을 삭제하는 비동기 액션
    deleteEmployee: async (id) => {
      set({ loading: true, error: null });
      try {
        // 삭제 API 호출
        await deleteEmployee(id);
        // 성공 시: 해당 ID의 직원을 목록에서 제거, 로딩 종료
        set(state => ({
          employees: state.employees.filter(emp => emp.id !== id),
          loading: false
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('직원 삭제 중 오류 발생:', error);
        throw error;
      }
    },

    // 현재 선택된 직원 정보를 초기화하는 액션
    // (상세 조회 화면을 닫거나 새로운 조회를 시작할 때 사용)
    clearCurrentEmployee: () => set({ currentEmployee: null })
}), {
  // Redux DevTools에서 이 스토어를 식별하기 위한 이름
  name: 'employee-store'
}));

export default useEmployeeStore;