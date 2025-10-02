import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from '../services/DepartmentService';

// 부서(Department) 상태 관리를 위한 Zustand 스토어 생성
const useDepartmentStore = create(devtools((set, get) => ({
    // ========== 상태(State) 영역 ==========

    // 전체 부서 목록
    departments: [],
    // 현재 선택된 부서 정보
    currentDepartment: null,
    // API 호출 중 로딩 상태
    loading: false,
    // 에러 정보
    error: null,

    // ========== 액션(Actions) 영역 ==========

    // 로딩 상태 설정
    setLoading: (loading) => set({ loading }),

    // 에러 정보 설정
    setError: (error) => set({ error }),

    // 에러 정보 초기화
    clearError: () => set({ error: null }),

    // 모든 부서 목록 조회
    fetchDepartments: async () => {
      // 로딩 상태 시작 및 에러 초기화
      set({ loading: true, error: null });
      try {
        // API 호출로 부서 목록 가져오기
        const response = await getAllDepartments();
        // 성공 시 departments 상태 업데이트 및 로딩 종료
        set({ departments: response.data || [], loading: false });
      } catch (error) {
        // 실패 시 에러 정보 저장 및 로딩 종료
        set({ error: error.message, loading: false });
        console.error('부서 목록 조회 중 오류 발생:', error);
      }
    },

    // 특정 부서 상세 정보 조회
    fetchDepartment: async (id) => {
      set({ loading: true, error: null });
      try {
        const response = await getDepartmentById(id);
        // 성공 시 현재 부서 정보 저장 및 로딩 종료
        set({ currentDepartment: response.data, loading: false });
        return response.data; // 호출부에서 사용할 수 있도록 데이터 반환
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('부서 상세 정보 조회 중 오류 발생:', error);
        throw error; // 호출부에서 에러 처리할 수 있도록 에러 전파
      }
    },

    // 새로운 부서 생성
    createDepartment: async (departmentData) => {
      set({ loading: true, error: null });
      try {
        const response = await createDepartment(departmentData);
        const newDepartment = response.data;
        // 기존 departments 배열에 새 부서 추가
        set(state => ({
          departments: [...state.departments, newDepartment],
          loading: false
        }));
        return newDepartment;
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('부서 생성 중 오류 발생:', error);
        throw error;
      }
    },

    // 부서 정보 수정
    updateDepartment: async (id, departmentData) => {
      set({ loading: true, error: null });
      try {
        const response = await updateDepartment(id, departmentData);
        const updatedDepartment = response.data;
        set(state => ({
          // departments 배열에서 해당 id의 부서 정보만 업데이트
          departments: state.departments.map(dept =>
            dept.id === parseInt(id) ? updatedDepartment : dept
          ),
          // 현재 선택된 부서 정보도 업데이트
          currentDepartment: updatedDepartment,
          loading: false
        }));
        return updatedDepartment;
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error('부서 정보 수정 중 오류 발생:', error);
        throw error;
      }
  },

  // 부서 삭제
  deleteDepartment: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDepartment(id);
      set(state => ({
        // 해당 id를 가진 부서를 제외한 나머지 부서들로 배열 필터링
        departments: state.departments.filter(dept => dept.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      console.error('부서 삭제 중 오류 발생:', error);
      throw error;
    }
  },

  // 현재 선택된 부서 정보 초기화
  clearCurrentDepartment: () => set({ currentDepartment: null })
}), {
  // Redux DevTools에서 식별할 스토어 이름
  name: 'department-store'
}));

export default useDepartmentStore;